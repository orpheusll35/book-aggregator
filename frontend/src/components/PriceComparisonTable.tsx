import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import type { Vendor } from "@/types";
import { cn } from "@/lib/utils";

interface PriceComparisonTableProps {
    vendors: Vendor[];
}

export default function PriceComparisonTable({ vendors }: PriceComparisonTableProps) {
    // Sort vendors by price (low to high)
    const sortedVendors = [...vendors].sort((a, b) => a.price - b.price);
    // bestPrice is implicitly the price of sortedVendors[0]

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[40%] font-serif font-bold text-ink">Mağaza</TableHead>
                        <TableHead className="font-serif font-bold text-ink">Stok Durumu</TableHead>
                        <TableHead className="text-right font-serif font-bold text-ink">Fiyat</TableHead>
                        <TableHead className="text-right font-serif font-bold text-ink">İşlem</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedVendors.map((vendor, index) => (
                        <TableRow key={vendor.name} className={cn(index === 0 && "bg-green-50/50 hover:bg-green-50/80")}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-paper border flex items-center justify-center text-sm font-serif font-bold text-ink shadow-sm">
                                        {vendor.name[0]}
                                    </div>
                                    <span className="text-ink">{vendor.name}</span>
                                    {index === 0 && (
                                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                            En İyi Fiyat
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {vendor.inStock ? (
                                    <div className="flex items-center text-green-600 text-sm font-medium">
                                        <CheckCircle className="w-4 h-4 mr-1.5" /> Stokta Var
                                    </div>
                                ) : (
                                    <div className="flex items-center text-red-500 text-sm font-medium">
                                        <XCircle className="w-4 h-4 mr-1.5" /> Stokta Yok
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg text-ink font-serif">
                                {vendor.inStock ? `${vendor.currency} ${vendor.price.toFixed(2)}` : "Stokta Yok"}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" className={cn(index === 0 ? "bg-accent hover:bg-accent/90" : "bg-ink hover:bg-ink/90")} asChild>
                                    <a href={vendor.url} target="_blank" rel="noopener noreferrer">
                                        Mağazaya Git <ExternalLink className="ml-2 h-3 w-3" />
                                    </a>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
