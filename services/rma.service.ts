import { IRmaSubmission, ISubmitRmaResponse } from "@/interfaces/rma";

export const submitRma = async (data: IRmaSubmission): Promise<ISubmitRmaResponse> => {
  try {
    const response = await fetch("/api/send-rma", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "submitRma",
        data,
      }),
    });

    const result: ISubmitRmaResponse | null = await response.json().catch(() => null);

    if (!result) {
      return { success: false, data: null, message: "Failed to submit RMA. Please try again." };
    }

    return result;
  } catch (error) {
    console.error("[rma.service] Submit error:", error);
    return { success: false, data: null, message: "Network error while submitting. Please try again." };
  }
};
