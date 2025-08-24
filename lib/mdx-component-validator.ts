import { ComponentMetadata } from './types/mdx-components';
import { componentDocs } from './mdx-component-docs';

export interface ValidationError {
  component: string;
  prop: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate component props against their definitions
 */
export function validateComponentProps(
  componentName: string, 
  props: Record<string, any>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  const componentDoc = componentDocs[componentName];
  if (!componentDoc) {
    errors.push({
      component: componentName,
      prop: '',
      message: `Unknown component: ${componentName}`,
      severity: 'error'
    });
    
    return {
      isValid: false,
      errors,
      warnings
    };
  }

  // Check required props
  Object.entries(componentDoc.props).forEach(([propName, propDef]) => {
    if (propDef.required && !(propName in props)) {
      errors.push({
        component: componentName,
        prop: propName,
        message: `Required prop '${propName}' is missing`,
        severity: 'error'
      });
    }
  });

  // Check prop types (basic validation)
  Object.entries(props).forEach(([propName, propValue]) => {
    const propDef = componentDoc.props[propName];
    
    if (!propDef) {
      warnings.push({
        component: componentName,
        prop: propName,
        message: `Unknown prop '${propName}' for component ${componentName}`,
        severity: 'warning'
      });
      return;
    }

    // Basic type checking
    const expectedType = propDef.type.toLowerCase();
    const actualType = typeof propValue;
    
    if (expectedType.includes('string') && actualType !== 'string') {
      errors.push({
        component: componentName,
        prop: propName,
        message: `Expected string for prop '${propName}', got ${actualType}`,
        severity: 'error'
      });
    }
    
    if (expectedType.includes('number') && actualType !== 'number') {
      errors.push({
        component: componentName,
        prop: propName,
        message: `Expected number for prop '${propName}', got ${actualType}`,
        severity: 'error'
      });
    }
    
    if (expectedType.includes('boolean') && actualType !== 'boolean') {
      errors.push({
        component: componentName,
        prop: propName,
        message: `Expected boolean for prop '${propName}', got ${actualType}`,
        severity: 'error'
      });
    }
    
    if (expectedType.includes('array') && !Array.isArray(propValue)) {
      errors.push({
        component: componentName,
        prop: propName,
        message: `Expected array for prop '${propName}', got ${actualType}`,
        severity: 'error'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate all components in MDX content
 */
export function validateMDXComponents(content: string): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];
  
  // Find all JSX components in the content
  const componentMatches = content.match(/<[A-Z][a-zA-Z0-9]*[\s\S]*?>/g) || [];
  
  componentMatches.forEach(match => {
    // Extract component name and props
    const componentMatch = match.match(/<([A-Z][a-zA-Z0-9]*)([\s\S]*?)>/);
    if (!componentMatch) return;
    
    const componentName = componentMatch[1];
    const propsString = componentMatch[2];
    
    // Basic props extraction (simplified)
    const props: Record<string, any> = {};
    const propMatches = propsString.match(/(\w+)=(?:{([^}]*)}|"([^"]*)"|'([^']*)')/g) || [];
    
    propMatches.forEach(propMatch => {
      const propParts = propMatch.match(/(\w+)=(?:{([^}]*)}|"([^"]*)"|'([^']*)')/);
      if (propParts) {
        const propName = propParts[1];
        const propValue = propParts[2] || propParts[3] || propParts[4];
        props[propName] = propValue;
      }
    });
    
    const result = validateComponentProps(componentName, props);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Get suggestions for component usage
 */
export function getComponentSuggestions(componentName: string): string[] {
  const componentDoc = componentDocs[componentName];
  if (!componentDoc) {
    return [`Component '${componentName}' not found. Available components: ${Object.keys(componentDocs).join(', ')}`];
  }
  
  const suggestions: string[] = [];
  
  // Add basic usage suggestion
  suggestions.push(`${componentDoc.description}`);
  
  // Add required props info
  const requiredProps = Object.entries(componentDoc.props)
    .filter(([, propDef]) => propDef.required)
    .map(([propName]) => propName);
    
  if (requiredProps.length > 0) {
    suggestions.push(`Required props: ${requiredProps.join(', ')}`);
  }
  
  // Add example if available
  if (componentDoc.examples && componentDoc.examples.length > 0) {
    suggestions.push(`Example usage:\n${componentDoc.examples[0].code}`);
  }
  
  return suggestions;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.isValid) {
    return 'All components are valid!';
  }
  
  const errorMessages: string[] = [];
  
  if (result.errors.length > 0) {
    errorMessages.push('Errors:');
    result.errors.forEach(error => {
      errorMessages.push(`  - ${error.component}${error.prop ? `.${error.prop}` : ''}: ${error.message}`);
    });
  }
  
  if (result.warnings.length > 0) {
    errorMessages.push('Warnings:');
    result.warnings.forEach(warning => {
      errorMessages.push(`  - ${warning.component}${warning.prop ? `.${warning.prop}` : ''}: ${warning.message}`);
    });
  }
  
  return errorMessages.join('\n');
}