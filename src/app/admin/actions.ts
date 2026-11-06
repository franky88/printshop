"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { adminConfigured, endSession, passwordOk, requireAdmin, startSession } from "@/lib/admin-auth";
import { canMove } from "@/lib/orders";
import { canMoveQuote } from "@/lib/quotes";
import { CatalogError, parseBasics, parseConfig, slug } from "@/lib/catalog-validate";
import { productToData } from "@/lib/catalog-db";
import { prisma } from "@/lib/prisma";

export async function login(_prev: { error: string }, formData: FormData): Promise<{ error: string }> {
  if (!adminConfigured()) {
    return { error: "Admin login isn't set up. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (16+ characters)." };
  }
  if (!passwordOk(String(formData.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 700)); // slows down password guessing
    return { error: "Wrong password." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function changeStatus(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") ?? "");
  const to = String(formData.get("to") ?? "");
  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || !canMove(order.status, to, order.delivery)) return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: to as OrderStatus, ...(to === "PAID" ? { paidAt: new Date() } : {}) },
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${code}`);
}

export async function changeQuoteStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const to = String(formData.get("to") ?? "");
  const row = await prisma.customQuoteRequest.findUnique({ where: { id } });
  if (!row || !canMoveQuote(row.status, to)) return;
  await prisma.customQuoteRequest.update({ where: { id }, data: { status: to } });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
}

async function freeId(base: string) {
  let id = base;
  for (let n = 2; await prisma.product.findUnique({ where: { id } }); n++) id = `${base}-${n}`;
  return id;
}

export async function saveProduct(
  _prev: { ok: boolean; error: string },
  formData: FormData,
): Promise<{ ok: boolean; error: string }> {
  await requireAdmin();
  const existingId = String(formData.get("id") ?? "");
  let createdId = "";
  try {
    const raw = JSON.parse(String(formData.get("payload") ?? "{}"));
    const basics = parseBasics(raw);
    let id = existingId;
    if (!id) {
      id = await freeId(slug(basics.name));
      createdId = id;
    } else if (!(await prisma.product.findUnique({ where: { id } }))) {
      throw new CatalogError("That product no longer exists.");
    }
    const product = parseConfig(raw, { id, ...basics });
    const data = { ...productToData(product), active: raw.active === true, sortOrder: Math.round(Number(raw.sortOrder) || 0) };
    if (existingId) await prisma.product.update({ where: { id }, data });
    else await prisma.product.create({ data: { id, ...data } });
  } catch (e) {
    if (e instanceof CatalogError) return { ok: false, error: e.message };
    console.error("Save product failed", e);
    return { ok: false, error: "Couldn't save. Please try again." };
  }
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/admin/products");
  if (createdId) redirect(`/admin/products/${createdId}`);
  return { ok: true, error: "" };
}
