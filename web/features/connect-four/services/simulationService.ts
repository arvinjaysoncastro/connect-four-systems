import { SimulateRequestDto, SimulateResponseDto } from "@/features/connect-four/domain/dto";
import { requestJson } from "@/features/connect-four/services/httpClient";

export async function runSimulationRequest(
  params: SimulateRequestDto,
): Promise<SimulateResponseDto> {
  return requestJson<SimulateResponseDto>("/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}
