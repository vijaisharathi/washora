import { redirect } from "next/navigation";

export default function CustomerAccountRedirect() {
  redirect("/customer/profile");
}
