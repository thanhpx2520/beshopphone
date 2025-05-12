// controller-factory.ts
import { Controller } from '@nestjs/common';

export function ApiV1Controller(path: string) {
  return Controller(`api/v1/${path}`);
}
