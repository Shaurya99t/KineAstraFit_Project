const IMAGE_LIBRARY = {
  push:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  pull:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  legs:
    "https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=1200&q=80",
  upper:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80",
  home:
    "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1200&q=80",
  recovery:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
};

const BLUEPRINTS = {
  push: {
    title: "Push Session",
    image: IMAGE_LIBRARY.push,
    exercises: [
      { name: "Barbell Bench Press", sets: "4", reps: "6-8", focus: "Chest power" },
      { name: "Incline Dumbbell Press", sets: "3", reps: "8-10", focus: "Upper chest" },
      { name: "Seated Shoulder Press", sets: "3", reps: "8-10", focus: "Front delts" },
      { name: "Cable Lateral Raise", sets: "3", reps: "12-15", focus: "Shoulder width" },
      { name: "Rope Pushdown", sets: "3", reps: "12-15", focus: "Triceps finish" },
    ],
  },
  pull: {
    title: "Pull Session",
    image: IMAGE_LIBRARY.pull,
    exercises: [
      { name: "Lat Pulldown", sets: "4", reps: "8-10", focus: "Back width" },
      { name: "Chest Supported Row", sets: "3", reps: "8-10", focus: "Mid-back" },
      { name: "Single Arm Dumbbell Row", sets: "3", reps: "10-12", focus: "Lats" },
      { name: "Rear Delt Fly", sets: "3", reps: "12-15", focus: "Rear delts" },
      { name: "Incline Curl", sets: "3", reps: "10-12", focus: "Biceps" },
    ],
  },
  legs: {
    title: "Leg Session",
    image: IMAGE_LIBRARY.legs,
    exercises: [
      { name: "Back Squat", sets: "4", reps: "5-8", focus: "Strength" },
      { name: "Romanian Deadlift", sets: "3", reps: "8-10", focus: "Hamstrings" },
      { name: "Leg Press", sets: "3", reps: "10-12", focus: "Quads" },
      { name: "Walking Lunge", sets: "3", reps: "12/leg", focus: "Glutes" },
      { name: "Standing Calf Raise", sets: "4", reps: "12-15", focus: "Calves" },
    ],
  },
  upper: {
    title: "Upper Session",
    image: IMAGE_LIBRARY.upper,
    exercises: [
      { name: "Incline Press", sets: "4", reps: "6-8", focus: "Chest" },
      { name: "Cable Row", sets: "4", reps: "8-10", focus: "Back" },
      { name: "Machine Shoulder Press", sets: "3", reps: "8-10", focus: "Delts" },
      { name: "EZ Bar Curl", sets: "3", reps: "10-12", focus: "Biceps" },
      { name: "Overhead Tricep Extension", sets: "3", reps: "10-12", focus: "Triceps" },
    ],
  },
  home: {
    title: "Home Strength",
    image: IMAGE_LIBRARY.home,
    exercises: [
      { name: "Push-Ups", sets: "4", reps: "10-15", focus: "Chest + triceps" },
      { name: "Goblet Squat", sets: "4", reps: "12", focus: "Quads" },
      { name: "Dumbbell Row", sets: "3", reps: "12/side", focus: "Back" },
      { name: "Split Squat", sets: "3", reps: "10/leg", focus: "Leg balance" },
      { name: "Plank", sets: "3", reps: "40 sec", focus: "Core" },
    ],
  },
  recovery: {
    title: "Recovery Session",
    image: IMAGE_LIBRARY.recovery,
    exercises: [
      { name: "Incline Walk", sets: "1", reps: "20 min", focus: "Low-impact cardio" },
      { name: "Thoracic Mobility", sets: "3", reps: "8", focus: "Upper back" },
      { name: "Hip Openers", sets: "3", reps: "8/side", focus: "Hip range" },
      { name: "Bodyweight Squat", sets: "3", reps: "12", focus: "Blood flow" },
      { name: "Breathing Reset", sets: "1", reps: "5 min", focus: "Recovery" },
    ],
  },
};

export function getWorkoutBlueprint(workoutType = "") {
  const normalized = workoutType.toLowerCase();

  if (normalized.includes("push")) return BLUEPRINTS.push;
  if (normalized.includes("pull")) return BLUEPRINTS.pull;
  if (normalized.includes("leg")) return BLUEPRINTS.legs;
  if (normalized.includes("upper")) return BLUEPRINTS.upper;
  if (normalized.includes("home")) return BLUEPRINTS.home;
  if (
    normalized.includes("recovery") ||
    normalized.includes("mobility") ||
    normalized.includes("deload") ||
    normalized.includes("reset")
  ) {
    return BLUEPRINTS.recovery;
  }

  return BLUEPRINTS.upper;
}
