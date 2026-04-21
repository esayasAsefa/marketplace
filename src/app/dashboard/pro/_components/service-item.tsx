"use client";

import { useState } from "react";
import { Trash2, Loader2, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteService } from "../actions";

type ServiceItemProps = {
  service: {
    id: number;
    title: string;
    categoryId: string;
    price: number;
    address: string | null;
    description: string;
  };
};

export function ServiceItem({ service }: ServiceItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this service? This will also cancel all related bookings.")) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    const result = await deleteService(service.id);
    if (result.success) {
      setDeleted(true);
    } else {
      setError(result.error || "Failed to delete");
    }
    setIsDeleting(false);
  };

  if (deleted) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-5 text-center text-sm text-muted-foreground">
        Service "{service.title}" has been deleted.
      </div>
    );
  }

  const hourlyRate = `$${(service.price / 100).toFixed(2)}`;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-semibold text-lg truncate">{service.title}</h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {service.categoryId.charAt(0).toUpperCase() + service.categoryId.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">{hourlyRate}</span>
              <span>/hr</span>
            </div>
            {service.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-500" />
                {service.address}
              </div>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
