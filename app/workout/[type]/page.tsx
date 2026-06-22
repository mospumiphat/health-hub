import { WORKOUT_TEMPLATES, WorkoutType } from "@/lib/types";
import WorkoutClient from "./WorkoutClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ type: string }>;
}

export function generateStaticParams() {
  return Object.keys(WORKOUT_TEMPLATES).map((type) => ({ type }));
}

export default async function WorkoutPage({ params }: Props) {
  const { type } = await params;
  if (!["push", "pull", "legs"].includes(type)) notFound();
  return <WorkoutClient type={type as WorkoutType} />;
}
