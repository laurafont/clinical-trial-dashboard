import { AddParticipantForm } from "./AddParticipantForm";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { ParticipantCreate } from "../../types/api";

interface AddParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addParticipant: (data: ParticipantCreate) => Promise<void>;
}

export function AddParticipantModal({
  open,
  onOpenChange,
  addParticipant,
}: AddParticipantModalProps) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={close}>
        <DialogHeader>
          <DialogTitle>Add participant</DialogTitle>
        </DialogHeader>
        <AddParticipantForm addParticipant={addParticipant} onSuccess={close} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
