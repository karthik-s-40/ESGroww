"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function NewAssessmentButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const year = new Date().getFullYear();
      const { createAssessmentCycle, setActiveAssessmentCycle } = await import("@/actions/assessmentCycle.actions");
      const res = await createAssessmentCycle(name, year);
      
      await setActiveAssessmentCycle(res.cycle.id);
      
      window.location.href = "/esg-readiness-platform";
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2 h-9 border-[#00673F] text-[#00673F] hover:bg-[#00673F]/10 font-semibold"
      >
        <Plus className="h-4 w-4" />
        Start New Assessment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Assessment Cycle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Assessment Name
              </label>
              <Input
                id="name"
                placeholder="e.g. FY 2025 Q1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || loading} className="bg-[#00673F] text-white hover:bg-[#005131]">
              {loading ? "Creating..." : "Create Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
