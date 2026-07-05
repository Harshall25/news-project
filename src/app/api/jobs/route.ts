import { handleFetchNewsRequest } from "../../../jobs/fetch-news";

export async function GET() {
  return handleFetchNewsRequest();
}