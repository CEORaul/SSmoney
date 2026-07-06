import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/admin";
import { formatDate } from "@/lib/date";
import { listFeedbacks } from "@/features/feedback/queries";
import { cn } from "@/lib/utils";

function StarsDisplay({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3.5",
            star <= rating ? "fill-primary text-primary" : "fill-transparent text-muted-foreground"
          )}
        />
      ))}
    </span>
  );
}

export default async function AdminFeedbacksPage() {
  const admin = await requireAdmin();
  if (!admin) {
    notFound();
  }

  const feedbacks = await listFeedbacks();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedbacks"
        description="Opiniões enviadas pelos usuários, mais recentes primeiro"
      />

      {feedbacks.length === 0 ? (
        <EmptyState
          title="Nenhum feedback ainda"
          description="Assim que alguém enviar um feedback, ele aparecerá aqui."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nota</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Página</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>
                  <StarsDisplay rating={feedback.rating} />
                </TableCell>
                <TableCell className="max-w-sm whitespace-pre-wrap">{feedback.message}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{feedback.profile.fullName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{feedback.profile.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{feedback.page}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(feedback.createdAt, "dd/MM/yyyy HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
