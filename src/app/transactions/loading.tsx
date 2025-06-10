import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <div className="p-4">
          <div className="flex border-b pb-4">
            <Skeleton className="h-5 w-1/5 mr-4" />
            <Skeleton className="h-5 w-1/5 mr-4" />
            <Skeleton className="h-5 w-1/5 mr-4" />
            <Skeleton className="h-5 w-1/5 mr-4" />
            <Skeleton className="h-5 w-1/5" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex py-4 border-b last:border-0">
              <Skeleton className="h-5 w-1/5 mr-4" />
              <Skeleton className="h-5 w-1/5 mr-4" />
              <Skeleton className="h-5 w-1/5 mr-4" />
              <Skeleton className="h-5 w-1/5 mr-4" />
              <Skeleton className="h-5 w-1/5" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 