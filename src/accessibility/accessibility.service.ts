import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RouteQaInventoryEngine,
  SemanticHtmlAuditEngine,
  KeyboardNavigationEngine,
  FormAccessibilityEngine,
  ColorContrastEngine,
  ResponsiveViewportEngine,
  CrossBrowserMatrixEngine,
  ScreenReaderSimulationEngine,
  ReducedMotionAndZoomEngine,
  StateAccessibilityEngine,
} from './accessibility-core.mjs';

@Injectable()
export class AccessibilityService {
  private readonly logger = new Logger(AccessibilityService.name);

  constructor(private readonly configService: ConfigService) {}

  getRouteInventory() {
    const engine = new RouteQaInventoryEngine();
    return engine.getRouteInventory();
  }

  auditSemanticHtml() {
    const engine = new SemanticHtmlAuditEngine();
    return engine.auditLandmarksAndHeadings();
  }

  simulateKeyboardNavigation() {
    const engine = new KeyboardNavigationEngine();
    return engine.simulateKeyboardInteraction();
  }

  auditFormAccessibility() {
    const engine = new FormAccessibilityEngine();
    return engine.auditFormControls();
  }

  auditColorContrast() {
    const engine = new ColorContrastEngine();
    return engine.auditContrastPairs();
  }

  auditResponsiveViewports() {
    const engine = new ResponsiveViewportEngine();
    return engine.auditViewportsAndTouch();
  }

  auditCrossBrowserCompatibility() {
    const engine = new CrossBrowserMatrixEngine();
    return engine.auditBrowserSupport();
  }

  simulateScreenReaderBookingFlow() {
    const engine = new ScreenReaderSimulationEngine();
    return engine.simulateBookingFlowScreenReaderTree();
  }

  auditReducedMotionAndZoom() {
    const engine = new ReducedMotionAndZoomEngine();
    return engine.auditReducedMotionAndZoom();
  }

  auditStateAccessibility() {
    const engine = new StateAccessibilityEngine();
    return engine.auditStateComponents();
  }
}
