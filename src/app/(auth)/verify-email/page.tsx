import Link from "next/link";
import { MailCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <MailCheck className="mb-2 size-10 text-muted-foreground" />
        <CardTitle>Confirme seu e-mail</CardTitle>
        <CardDescription>
          Enviamos um link de confirmação para o e-mail informado. Clique no
          link para ativar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground">
          Voltar para o login
        </Link>
      </CardContent>
    </Card>
  );
}
