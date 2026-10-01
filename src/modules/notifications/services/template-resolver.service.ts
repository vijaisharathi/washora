import { BadRequestException, Injectable } from '@nestjs/common';
import {
  NotificationErrorCode,
  TemplateVariableWhitelist,
} from '../types/notifications.types';

@Injectable()
export class TemplateResolverService {
  private readonly allowedVariables = new Set<string>(TemplateVariableWhitelist);
  private readonly tokenPattern = /\{\{([a-zA-Z0-9_]+)\}\}/g;

  /**
   * Validates that all tokens in the template strings are in the allowed whitelist.
   * Throws TEMPLATE_VARIABLE_INVALID if an unknown token is found.
   */
  validateTemplate(template: string, fieldName = 'template'): void {
    if (!template) return;

    let match: RegExpExecArray | null;
    const regex = new RegExp(this.tokenPattern);

    while ((match = regex.exec(template)) !== null) {
      const varName = match[1];
      if (!this.allowedVariables.has(varName)) {
        throw new BadRequestException({
          code: NotificationErrorCode.TEMPLATE_VARIABLE_INVALID,
          message: `Variable '{{${varName}}}' in ${fieldName} is not permitted in notification templates. Allowed variables: ${Array.from(this.allowedVariables).join(', ')}`,
        });
      }
    }
  }

  /**
   * Safely interpolates variables into the template string.
   * Defends against prototype pollution, code injection, and handles undefined variables gracefully.
   */
  interpolate(template: string, variables: Record<string, any>): string {
    if (!template) return '';

    return template.replace(this.tokenPattern, (_match, varName) => {
      if (Object.prototype.hasOwnProperty.call(variables, varName)) {
        const val = variables[varName];
        if (val === null || val === undefined) {
          return '';
        }
        // Sanitize string output
        return String(val)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }
      return '';
    });
  }
}
