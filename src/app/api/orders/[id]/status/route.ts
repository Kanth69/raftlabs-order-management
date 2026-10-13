import { NextRequest } from 'next/server';
import { PATCH as updateOrder } from '../route';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return updateOrder(request, context);
}
