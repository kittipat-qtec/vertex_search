import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getRequestUser } from "@/lib/auth";

export const getOptionalServerUser = cache(async () => {
  const requestHeaders = await headers();

  return getRequestUser(new Headers(requestHeaders));
});

export const requireServerUser = cache(async () => {
  const user = await getOptionalServerUser();

  if (!user) {
    redirect("/unauthorized");
  }

  return user;
});

export const requireServerAdmin = cache(async () => {
  const user = await requireServerUser();

  if (!user.isAdmin) {
    redirect("/unauthorized");
  }

  return user;
});
