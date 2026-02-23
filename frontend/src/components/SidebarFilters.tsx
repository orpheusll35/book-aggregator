import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SidebarFilters() {
    const [priceRange, setPriceRange] = useState([0, 50]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-4 text-lg font-semibold">Filtreler</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Fiyat Aralığı ({priceRange[0]}₺ - {priceRange[1]}₺)</Label>
                        <Slider
                            defaultValue={[0, 50]}
                            max={100}
                            step={1}
                            value={priceRange}
                            onValueChange={setPriceRange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Stok Durumu</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="instock" />
                            <label
                                htmlFor="instock"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Sadece Stokta Olanlar
                            </label>
                        </div>
                    </div>
                    <Button className="w-full">Filtreleri Uygula</Button>
                </div>
            </div>
        </div>
    );
}
