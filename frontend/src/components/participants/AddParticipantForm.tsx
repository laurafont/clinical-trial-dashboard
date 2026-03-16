import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import type { ParticipantCreate } from "../../types/api";

const MIN_ENROLLMENT_YEAR = 1900;

const formSchema = z.object({
  subject_id: z.string().min(1, { message: "Subject ID is required" }),
  study_group: z.enum(["treatment", "control"], {
    message: "Study group is required",
  }),
  enrollment_date: z
    .string()
    .min(1, { message: "Enrollment date is required" })
    .refine(
      (val) => {
        const date = new Date(val);
        if (Number.isNaN(date.getTime())) return false;
        const year = date.getUTCFullYear();
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return year >= MIN_ENROLLMENT_YEAR && date <= today;
      },
      {
        message: `Enrollment date must be a valid date between ${MIN_ENROLLMENT_YEAR} and today (not in the future).`,
      },
    ),
  status: z.enum(["active", "completed", "withdrawn"], {
    message: "Status is required",
  }),
  age: z
    .number({ message: "Age is required" })
    .int()
    .min(0, "Age must be 0 or more")
    .max(120, "Age must be 120 or less"),
  gender: z.enum(["F", "M", "Other"], { message: "Gender is required" }),
});

type FormFields = z.infer<typeof formSchema>;

interface AddParticipantFormProps {
  addParticipant: (data: ParticipantCreate) => Promise<void>;
}

export function AddParticipantForm({
  addParticipant,
}: AddParticipantFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      await addParticipant(data);
      reset();
    } catch {
      setError("root", {
        message: "Failed to add participant. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="subject_id">Subject ID</Label>
          <Input
            id="subject_id"
            {...register("subject_id")}
            aria-invalid={!!errors.subject_id}
          />
          {errors.subject_id && (
            <p className="text-xs text-destructive" role="alert">
              {errors.subject_id.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="study_group">Study Group</Label>
          <Select
            id="study_group"
            {...register("study_group")}
            aria-invalid={!!errors.study_group}
          >
            <option value="">Select...</option>
            <option value="treatment">Treatment</option>
            <option value="control">Control</option>
          </Select>
          {errors.study_group && (
            <p className="text-xs text-destructive" role="alert">
              {errors.study_group.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="enrollment_date">Enrollment Date</Label>
          <Input
            id="enrollment_date"
            type="date"
            {...register("enrollment_date")}
            aria-invalid={!!errors.enrollment_date}
          />
          {errors.enrollment_date && (
            <p className="text-xs text-destructive" role="alert">
              {errors.enrollment_date.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            {...register("status")}
            aria-invalid={!!errors.status}
          >
            <option value="">Select...</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="withdrawn">Withdrawn</option>
          </Select>
          {errors.status && (
            <p className="text-xs text-destructive" role="alert">
              {errors.status.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={150}
            {...register("age", { valueAsNumber: true })}
            aria-invalid={!!errors.age}
          />
          {errors.age && (
            <p className="text-xs text-destructive" role="alert">
              {errors.age.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            id="gender"
            {...register("gender")}
            aria-invalid={!!errors.gender}
          >
            <option value="">Select...</option>
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="Other">Other</option>
          </Select>
          {errors.gender && (
            <p className="text-xs text-destructive" role="alert">
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>

      {errors.root && (
        <p className="text-xs text-destructive" role="alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding…" : "Add participant"}
      </Button>
    </form>
  );
}
