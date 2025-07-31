"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";

const AVAILABLE_APPLIANCES = [
  { id: 'stove', name: 'Stove', emoji: '🔥' },
  { id: 'oven', name: 'Oven', emoji: '🍞' },
  { id: 'microwave', name: 'Microwave', emoji: '📡' },
  { id: 'air_fryer', name: 'Air Fryer', emoji: '💨' },
  { id: 'grill', name: 'Grill', emoji: '🥩' },
  { id: 'blender', name: 'Blender', emoji: '🥤' },
  { id: 'slow_cooker', name: 'Slow Cooker', emoji: '🍲' },
  { id: 'pressure_cooker', name: 'Pressure Cooker', emoji: '⚡' },
];

export function ApplianceSelector() {
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClient();

  // Load existing appliances
  useEffect(() => {
    const loadAppliances = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('appliances')
          .select('name')
          .eq('user_id', user.id);

        if (error) throw error;
        setSelectedAppliances(data?.map(item => item.name) || []);
      } catch (error) {
        console.error('Error loading appliances:', error);
      }
    };

    loadAppliances();
  }, [supabase]);

  const toggleAppliance = async (applianceName: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isSelected = selectedAppliances.includes(applianceName);
      
      if (isSelected) {
        // Remove appliance
        const { error } = await supabase
          .from('appliances')
          .delete()
          .eq('user_id', user.id)
          .eq('name', applianceName);

        if (error) throw error;
        setSelectedAppliances(selectedAppliances.filter(app => app !== applianceName));
      } else {
        // Add appliance
        const { error } = await supabase
          .from('appliances')
          .insert({ 
            user_id: user.id, 
            name: applianceName 
          });

        if (error) throw error;
        setSelectedAppliances([...selectedAppliances, applianceName]);
      }
    } catch (error) {
      console.error('Error toggling appliance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          {AVAILABLE_APPLIANCES.map((appliance) => (
            <div key={appliance.id} className="flex items-center space-x-3">
              <Checkbox
                id={appliance.id}
                checked={selectedAppliances.includes(appliance.name)}
                onCheckedChange={() => toggleAppliance(appliance.name)}
                disabled={isLoading}
              />
              <label 
                htmlFor={appliance.id} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                <span>{appliance.emoji}</span>
                {appliance.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-foreground/70">
        <p>Selected: {selectedAppliances.length} appliances</p>
      </div>
    </div>
  );
}
