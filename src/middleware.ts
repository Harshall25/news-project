import { NextRequest, NextResponse } from "next/server";

//suth middle ware protectued routes
export default function middleware(req: NextRequest) {
  return NextResponse.next();
}