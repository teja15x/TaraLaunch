import { NextResponse } from 'next/server';
import {
  PRODUCT_VERSIONS,
  MOBILE_MVP_PRIORITY,
  MOBILE_CAPABILITY_MATRIX,
  MOBILE_EXECUTION_PHASES,
} from '@/lib/domain/productScope';

export async function GET() {
  return NextResponse.json({
    versions: PRODUCT_VERSIONS,
    mobileMvpPriority: MOBILE_MVP_PRIORITY,
    capabilityMatrix: MOBILE_CAPABILITY_MATRIX,
    executionPhases: MOBILE_EXECUTION_PHASES,
  });
}
