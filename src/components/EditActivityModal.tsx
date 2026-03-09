"use client";
import { useState } from "react";
import { Loader2, Sparkles, MapPin, Clock, DollarSign, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Activity } from "@/lib/openai";
import { BOOKING_API_URL } from "@/lib/config";

interface EditActivityModalProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
  dayIndex: number;
  destination: string;
  onSave: (updatedActivity: Activity) => void;
}

export default function EditActivityModal({
  open,
  onClose,
  activity,
  dayIndex,
  destination,
  onSave,
}: EditActivityModalProps) {
  const [mode, setMode] = useState<"edit" | "ai-suggest">("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [suggestedActivity, setSuggestedActivity] = useState<Activity | null>(null);

  // Editable fields (manual edit mode)
  const [title, setTitle] = useState(activity?.title || "");
  const [description, setDescription] = useState(activity?.description || "");
  const [time, setTime] = useState(activity?.time || "");
  const [location, setLocation] = useState(activity?.location || "");
  const [cost, setCost] = useState(activity?.cost || "");
  const [duration, setDuration] = useState(activity?.duration || "");

  // Sync fields when activity changes
  const resetFields = (a: Activity | null) => {
    setTitle(a?.title || "");
    setDescription(a?.description || "");
    setTime(a?.time || "");
    setLocation(a?.location || "");
    setCost(a?.cost || "");
    setDuration(a?.duration || "");
    setSuggestedActivity(null);
    setAiPrompt("");
    setMode("edit");
  };

  const handleClose = () => {
    resetFields(activity);
    onClose();
  };

  // ── AI Suggestion ─────────────────────────────────────────────────────────
  const handleAiSuggest = async () => {
    if (!activity) return;
    setIsGenerating(true);
    setSuggestedActivity(null);

    const token = localStorage.getItem("authToken");

    const prompt = `
You are a travel activity planner. A traveler is visiting ${destination} on Day ${dayIndex}.

They currently have this activity scheduled:
- Title: ${activity.title}
- Time: ${activity.time}
- Location: ${activity.location}
- Description: ${activity.description}

The traveler wants a replacement because: "${aiPrompt || "They want a different activity at the same time slot."}"

Suggest ONE alternative activity for the same time slot in ${destination}.

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "title": "Activity Name",
  "description": "Brief description of the activity",
  "time": "${activity.time}",
  "location": "Specific place name in ${destination}",
  "cost": "$XX",
  "category": "${activity.category || "afternoon"}",
  "duration": "${activity.duration || "2 hours"}"
}`;
    try {
      const response = await fetch(`${BOOKING_API_URL}/api/generate-activity-suggestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination,
          dayIndex,
          currentActivity: activity,
          userPrompt: aiPrompt,
          prompt,
        }),
      });

      if (!response.ok) throw new Error("Failed to get suggestion");
      const data = await response.json();

      // Parse response — handle both {suggestion: {...}} and direct JSON
      const suggestion = data.suggestion || data;
      setSuggestedActivity({
        title: suggestion.title || "",
        description: suggestion.description || "",
        time: suggestion.time || activity.time,
        location: suggestion.location || "",
        cost: suggestion.cost || "",
        category: suggestion.category || activity.category,
        duration: suggestion.duration || activity.duration,
        booked: suggestion.booked || activity.booked,
      });
    } catch (err) {
      console.error("AI suggestion error:", err);
      // Fallback: fill fields with a generic suggestion structure
      setSuggestedActivity({
        title: "Suggested Alternative",
        description: "AI suggestion unavailable. Please edit manually.",
        time: activity.time,
        location: destination,
        cost: activity.cost,
        category: activity.category,
        duration: activity.duration,
        booked: activity.booked,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Accept AI suggestion → pre-fill manual edit fields
  const handleAcceptSuggestion = () => {
    if (!suggestedActivity) return;
    setTitle(suggestedActivity.title);
    setDescription(suggestedActivity.description);
    setTime(suggestedActivity.time);
    setLocation(suggestedActivity.location);
    setCost(suggestedActivity.cost);
    setDuration(suggestedActivity.duration || "");
    setSuggestedActivity(null);
    setMode("edit");
  };

  // Save manual edits
  const handleSave = () => {
    if (!activity) return;
    onSave({
      ...activity,
      title,
      description,
      time,
      location,
      cost,
      duration,
    });
    handleClose();
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Edit Activity</span>
            <Badge variant="outline" className="text-xs font-normal">
              Day {dayIndex}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setMode("edit")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              mode === "edit"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ✏️ Edit Manually
          </button>
          <button
            onClick={() => setMode("ai-suggest")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              mode === "ai-suggest"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ✨ AI Suggest
          </button>
        </div>

        {/* ── Current activity summary (always visible) ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
          <p className="font-semibold text-blue-900 mb-1">Current: {activity.title}</p>
          <div className="flex flex-wrap gap-3 text-blue-700 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {activity.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {activity.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> {activity.cost}
            </span>
          </div>
        </div>

        {/* ── AI Suggest Mode ── */}
        {mode === "ai-suggest" && (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">
                Why do you want to change this activity?
              </Label>
              <Textarea
                className="mt-1.5 text-sm"
                placeholder={`e.g. "I don't like crowded places", "Want something outdoors", "Looking for local food experience"...`}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleAiSuggest}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating alternative...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggest Alternative
                </>
              )}
            </Button>

            {/* AI Suggestion Result */}
            {suggestedActivity && (
              <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI Suggestion
                  </p>
                  <button
                    onClick={() => { setSuggestedActivity(null); }}
                    className="text-purple-400 hover:text-purple-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="font-bold text-gray-900">{suggestedActivity.title}</p>
                <p className="text-sm text-gray-600">{suggestedActivity.description}</p>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {suggestedActivity.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {suggestedActivity.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> {suggestedActivity.cost}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleAcceptSuggestion}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Check className="mr-1 h-3 w-3" /> Use This
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAiSuggest}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Manual Edit Mode ── */}
        {mode === "edit" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Activity Name</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. Visit Amber Fort"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 text-sm"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Time Slot</Label>
                <Input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. 9:00 AM - 11:00 AM"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Duration</Label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. 2 hours"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. Old City, Jaipur"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Estimated Cost</Label>
                <Input
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. $10"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {mode === "edit" && (
            <Button onClick={handleSave} className="bg-primary">
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}