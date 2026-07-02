import { redirect } from "next/navigation";

export default function RetrospectiveIndexPage() {
  redirect(`/retrospective/${new Date().getFullYear()}`);
}
