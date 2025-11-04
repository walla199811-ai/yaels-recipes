# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yael's Recipes is a Hebrew RTL recipe management application built with Next.js 14, featuring Temporal.io workflow orchestration, PostgreSQL database, and comprehensive testing. The application is designed specifically for Hebrew content with right-to-left layout support, and includes an elegant animated startup page that welcomes users on each new session.

## Architecture

### Core Technologies
- **Frontend**: Next.js 14 App Router with TypeScript
- **UI Framework**: Material-UI v5 with Hebrew RTL theme
- **Database**: PostgreSQL with Prisma ORM
- **Workflow Engine**: Temporal.io for recipe operations and email notifications
- **Image Storage**: Cloudinary integration
- **Email**: Gmail SMTP via Nodemailer
- **Testing**: Cypress for E2E and component testing
- **Documentation**: Storybook with Hebrew RTL support

### Key Architectural Patterns

#### Temporal.io Integration
The application uses Temporal.io workflows for all recipe CRUD operations:
- **Workflows**: Located in `src/temporal/workflows/recipe-workflow.ts`
- **Activities**: Recipe operations and email notifications in `src/temporal/activities/`
- **Workers**: Background processing in `src/temporal/workers/recipe-worker.ts`
- **Client**: Temporal client setup in `src/temporal/client/temporal-client.ts`

#### Service Layer Architecture
- **Direct Services**: `src/services/recipe-service-direct.ts` for immediate operations
- **Temporal Services**: `src/services/recipe-service.ts` for workflow-based operations
- **Email Services**: Both direct and Temporal-based email implementations

#### Database Schema
Single Recipe model with comprehensive fields:
```typescript
model Recipe {
  id               String         @id @default(cuid())
  title            String
  description      String?
  category         RecipeCategory // Simplified: MAIN, SIDE, DESSERT
  prepTimeMinutes  Int
  cookTimeMinutes  Int
  servings         Int
  ingredients      Json // Array of { order: number, text: string }
  instructions     Json // Array of { step: number, text: string }
  photoUrl         String?
  tags             String[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  createdBy        String
  lastModifiedBy   String
}

enum RecipeCategory {
  MAIN      // מנה עיקרית
  SIDE      // תוספת
  DESSERT   // קינוח
}
```

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build application
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Run database migrations
npm run db:migrate

# Deploy migrations to production
npm run db:migrate:deploy

# Seed database with test data
npm run db:seed
```

### Temporal.io Development
```bash
# Start Temporal development server (port 7234, UI port 8234)
npm run temporal:dev

# Start Temporal worker
npm run temporal:worker

# Production Temporal server
npm run temporal:server:prod
```

### Testing
```bash
# Open Cypress test UI
npm run test

# Run E2E tests headlessly
npm run test:headless

# Open component testing UI
npx cypress open --component

# Run component tests headlessly
npx cypress run --component
```

### Storybook
```bash
# Start Storybook development server (port 6006)
npm run storybook

# Build static Storybook
npm run build-storybook
```

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_FROM="Your Name <your-email@gmail.com>"
NOTIFICATION_EMAILS="notifications@gmail.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Temporal
TEMPORAL_ADDRESS="localhost:7234"
TEMPORAL_NAMESPACE="default"
```

## Startup Page & Session Management

The application features an elegant animated startup page that provides a warm welcome for new sessions while maintaining optimal user experience.

### StartupPage Component (`src/components/StartupPage.tsx`)
A beautifully animated welcome screen with:
- **Floating Images**: Four circular images with smooth floating animations at different positions
- **Sequential Animations**: Title, subtitle, and dedication text appear in timed sequence
- **Hebrew RTL Support**: Fully compatible with Hebrew layout and typography
- **Click-to-Continue**: Entire page is clickable to proceed to main application
- **Responsive Design**: Adapts beautifully to all screen sizes

### Session-Based Display Logic
Uses `sessionStorage` for intelligent display management:
- **Shows startup page**: On new tabs, new browser windows, fresh browser sessions
- **Skips startup page**: On page refreshes, back/forward navigation within same tab
- **Perfect Balance**: Welcoming for new sessions, non-intrusive for active usage

### useFirstVisit Hook (`src/hooks/useFirstVisit.ts`)
Custom hook managing startup page display logic:
```typescript
// Session-based storage for optimal UX
const hasVisited = sessionStorage.getItem(FIRST_VISIT_KEY)
const markAsVisited = () => sessionStorage.setItem(FIRST_VISIT_KEY, 'true')
```

### Implementation Details
- **Integration**: Main page (`src/app/page.tsx`) conditionally renders StartupPage vs Homepage
- **Smooth Transitions**: Fade animations between startup and main content
- **Development Testing**: Use browser dev tools to clear sessionStorage for retesting
- **Storybook Support**: Full documentation with interactive examples

### Key Benefits
- **Brand Experience**: Professional, warm first impression
- **User Engagement**: Beautiful animations create emotional connection
- **Performance**: Minimal impact on app load time
- **Accessibility**: Respects user preferences and maintains usability

## Hebrew RTL Considerations

### Theme Configuration
The application uses a custom Material-UI theme with RTL support:
- **Direction**: RTL for Hebrew content
- **Colors**: Nude brown palette (#A0826D primary, #F5E6D3 secondary)
- **Typography**: Roboto with Hebrew glyph support
- **RTL Cache**: Emotion cache with stylis RTL plugin

### Component Development
When creating new components:
- Use Material-UI components for automatic RTL support
- Test with Hebrew content in Storybook
- Add RTL-specific styling when needed
- Include Hebrew translations in `src/lib/translations.ts`

#### Hebrew Ingredients Autocomplete
The application includes a comprehensive Hebrew ingredients autocomplete system:
- **Database**: `src/data/hebrew-ingredients.ts` - 300+ Hebrew ingredients in 14 categories
- **Component**: `src/components/IngredientAutocomplete.tsx` - RTL Material-UI Autocomplete
- **Integration**: Used in RecipeForm for ingredient input with freeSolo mode
- **Categories**: דגנים וקמח, ירקות, פירות, בשר ועוף ודגים, חלב וביצים, קטניות ואגוזים, שמנים ושומנים, תבלינים ועשבי תיבול, מתקנים וסוכרים, שוקולד וחמרים מתוקים, חומרי אפייה, משקאות, רטבים וחומרי טעם, שימורים ומזון מעובד
- **Features**: Smart search (exact matches first, then partial), categorized suggestions, allows custom ingredients
- **Testing**: Storybook stories with Hebrew examples and interactive demonstrations

#### Simplified Recipe Filtering
The application features a clean, minimal filtering system for recipes:
- **UI Component**: `src/components/RecipeFilters.tsx` - Simple button group design
- **Design**: Clean Paper container with rounded buttons for category selection
- **Categories**: Only 3 simplified categories (הכל, מנה עיקרית, תוספת, קינוח)
- **User Experience**: Centered button group that works well on mobile and desktop
- **RTL Support**: Uses individual Button components with proper spacing for Hebrew text
- **Accessibility**: Large touch targets, clear visual feedback for selected state

### Testing Hebrew Content
- Use custom Cypress commands: `cy.typeHebrew()`, `cy.shouldContainHebrew()`
- Test fixtures include authentic Hebrew recipes
- Verify RTL layout with `cy.checkRTLLayout()`

## Temporal.io Workflow Patterns

### Recipe Operations Flow
1. Client calls API route (`/api/recipes`)
2. API routes use service layer to start Temporal workflow
3. Workflow executes recipe operation (create/update/delete)
4. Workflow sends email notification
5. Results returned to client

### Email Notifications
All recipe operations trigger email notifications via Temporal activities:
- Create: Notification with recipe details
- Update: Notification with changes
- Delete: Notification before deletion (fetches recipe data first)

### Error Handling
- Workflows have retry policies (max 3 attempts)
- 1-minute timeout for activities
- Graceful error handling with user feedback

## Testing Strategy

### E2E Tests (`cypress/e2e/`)
- Homepage functionality with Hebrew search and filtering
- Complete recipe CRUD operations
- Hebrew text input and validation
- RTL layout verification

### Component Tests (`cypress/component/`)
- Individual component testing with Hebrew content
- Material-UI theme provider setup
- RTL styling verification

### Test Data
- Authentic Hebrew recipes in `cypress/fixtures/recipes.json`
- Categories: קינוחים, עיקריות, סלטים, משקאות
- Tags: פרווה, בשרי, צמחוני, בריא, מהיר

## Deployment Architecture

### Production Setup
- **Frontend**: Vercel (Next.js deployment)
- **Database**: Neon PostgreSQL
- **Images**: Cloudinary
- **Email**: Gmail SMTP
- **Temporal Server**: Railway (self-hosted)
- **Temporal Worker**: Railway (separate service)

### Key Deployment Files
- `vercel.json`: Vercel configuration
- `Dockerfile.temporal`: Temporal server container
- `Dockerfile.worker`: Temporal worker container
- `railway.toml` & `railway-worker.toml`: Railway configurations

## Special Considerations

### Multi-Service Development
The application requires multiple services running simultaneously:
1. Next.js development server (`npm run dev`)
2. Temporal server (`npm run temporal:dev`)
3. Temporal worker (`npm run temporal:worker`)
4. Database (PostgreSQL)

### Combined Development Server
Use `start-combined-temporal.js` to run both Next.js and Temporal worker in development:
```bash
PORT=3001 node start-combined-temporal.js
```

### Recipe Data Structure
- **Ingredients**: JSON array with `{ order: number, text: string }`
- **Instructions**: JSON array with `{ step: number, text: string }`
- **Categories**: Enum with Hebrew names
- **Tags**: String array for flexible tagging

### Hidden UI Fields
The application maintains certain fields in the database but hides them from the user interface:
- **servings**: Set to indicative value `999` to show it's not real data
- **createdBy**: Set to indicative value `"מתכון מדוגמה"` (Sample Recipe) to show it's not real data

These fields are present in the database schema and backend logic but are not displayed in:
- RecipeCard component display
- RecipeForm input fields
- Recipe detail page
- Storybook stories (use indicative values consistently)

**Rationale**: These fields are kept in the backend for potential future use while being hidden from the current UI to simplify the user experience.

### File Upload Handling
- Images uploaded via Cloudinary
- PhotoUpload component handles drag-and-drop
- Automatic image optimization and transformation

## Common Development Tasks

### Adding New Recipe Categories
1. Update `RecipeCategory` enum in `prisma/schema.prisma`
2. Run `npm run db:push` to update database
3. Update translations in `src/lib/translations.ts`
4. Add to category filters in components

### Modifying Temporal Workflows
1. Update workflow definition in `src/temporal/workflows/`
2. Update activities in `src/temporal/activities/`
3. Restart Temporal worker (`npm run temporal:worker`)
4. Test workflow execution

### Adding New Components
1. Create component in `src/components/`
2. Add Storybook story with Hebrew examples
3. Add Cypress component tests
4. Document in component's docstring

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Generate migration: `npm run db:migrate`
3. Update TypeScript types
4. Update seed data if needed

## Troubleshooting

### Temporal Connection Issues
- Ensure Temporal server is running on correct port (7234)
- Check `TEMPORAL_ADDRESS` environment variable
- Verify network connectivity to Temporal server

### Hebrew Text Rendering
- Confirm RTL theme is properly configured
- Check Emotion cache setup for RTL
- Verify font loading for Hebrew glyphs

### Database Connection
- Verify `DATABASE_URL` format
- Ensure SSL mode for production databases
- Check connection pooling settings

### Email Notifications
- Verify Gmail app password (not regular password)
- Check SMTP configuration
- Test with `node test-email.js`

## AI-Powered Recipe Migration Pipeline

The application includes a sophisticated AI-powered migration system for importing Hebrew recipes from Word documents while preserving family stories, cultural context, and emotional connections.

### Overview

The migration pipeline transforms family recipe documents into structured database entries using Claude AI agents for intelligent Hebrew text parsing. This approach dramatically outperforms rule-based parsing by capturing:

- **Complete family stories and descriptions** (401-561 characters of rich context)
- **Accurate timing calculations** (e.g., 720 minutes for overnight soaking vs generic defaults)
- **Cultural context and emotional connections** (Shabbat traditions, family memories)
- **Precise ingredient measurements** and cooking instructions
- **Authentic Hebrew content preservation**

### Architecture

#### Core Components

1. **AI Migration Pipeline** (`scripts/ai-migration-pipeline.js`)
   - Main orchestration script using Claude agent integration
   - Processes Word documents via mammoth library for text extraction
   - Uses AI agents for intelligent Hebrew recipe parsing
   - Generates production-ready migration results

2. **SQL Generator** (`scripts/generate-sql-inserts.js`)
   - Converts AI-parsed recipes to PostgreSQL INSERT statements
   - Handles proper JSON escaping and Hebrew text encoding
   - Generates CUID-compatible UUIDs for recipe IDs
   - Creates database-ready SQL files for direct execution

3. **Word Document Parser** (`scripts/word-document-parser.js`)
   - Rule-based parser (deprecated in favor of AI approach)
   - Demonstrates the limitations of keyword-based Hebrew parsing
   - Maintained for reference and fallback scenarios

4. **Test Infrastructure** (`scripts/test-ai-parser.js`)
   - Validation and testing utilities for AI parsing
   - Example document processing demonstrations

### AI Agent Integration

The pipeline leverages Claude agents via the Task tool for intelligent parsing:

```javascript
// AI agent prompt for Hebrew recipe parsing
const prompt = this.createParsingPrompt(text, filePath);
const response = await this.callClaudeAgent(prompt);
const recipe = JSON.parse(response);
```

#### Parsing Guidelines

The AI agent follows comprehensive guidelines for Hebrew recipe parsing:

- **Title Extraction**: Identifies recipe names from document structure
- **Description Capture**: Preserves complete family stories and context (never summarizes)
- **Category Classification**: MAIN/SIDE/DESSERT based on Hebrew content analysis
- **Time Calculation**: Converts Hebrew time expressions to minutes (including overnight prep)
- **Ingredient Processing**: Structured extraction with order preservation
- **Instruction Parsing**: Step-by-step cooking directions with cultural nuances
- **Tag Generation**: Auto-detects Hebrew tags (פרווה, בשרי, צמחוני, etc.)

### Usage Examples

#### Basic Migration
```bash
# AI-powered migration with dry run
node scripts/ai-migration-pipeline.js --dry-run test-documents

# Production migration to database
node scripts/ai-migration-pipeline.js test-documents

# Generate SQL INSERT statements
node scripts/generate-sql-inserts.js
```

#### Command Options
```bash
# Available options
--dry-run            Preview results without database migration
--output, -o         Custom output file path
--check-connection   Test database connectivity
--help, -h          Show help information
```

### Migration Results

#### Successful AI Parsing Examples

1. **קרם שניט** (Cream Schnitt) - DESSERT
   - **Description**: 401-character family story about professional pastry course
   - **Timing**: 90 prep + 30 cook minutes (precise from text analysis)
   - **Context**: Professional cooking education, family baking traditions

2. **טאקו עוף של יעלי** (Yael's Chicken Tacos) - MAIN
   - **Description**: Family-style Mexican cooking experience
   - **Timing**: 20 prep + 25 cook minutes
   - **Context**: Interactive family meal preparation

3. **דגים של שישי** (Friday Fish) - MAIN
   - **Description**: Traditional Moroccan Shabbat preparation
   - **Timing**: 15 prep + 20 cook minutes
   - **Context**: Religious tradition, festive cooking

4. **מרק שעועית** (Bean Soup) - MAIN
   - **Description**: Complete 561-character family story spanning three paragraphs
   - **Timing**: 720 prep + 120 cook minutes (12 hours + 2 hours)
   - **Context**: Grandmother's love, family relationships, cooking wisdom

### File Structure

```
scripts/
├── ai-migration-pipeline.js      # Main AI-powered migration orchestrator
├── generate-sql-inserts.js       # SQL generation with UUID support
├── word-document-parser.js       # Legacy rule-based parser (reference)
├── ai-recipe-parser.js           # AI agent interface (development)
└── test-ai-parser.js            # Testing and validation utilities

Generated Files:
├── ai-migration-results.json     # Complete AI parsing results
└── recipe-inserts.sql           # Production-ready SQL statements
```

### Database Integration

#### Schema Compatibility
The migration pipeline generates data compatible with the Recipe model:

```sql
-- Example generated INSERT statement
INSERT INTO "recipes" (
  id, title, description, category, "prepTimeMinutes", "cookTimeMinutes",
  servings, ingredients, instructions, tags, "createdBy", "lastModifiedBy"
) VALUES (
  'cmhkgaxtmG9ouzShELU8',
  'קרם שניט',
  'בתחילת העשור הקודם, נרשמה יעלי לקורס קונדיטוריה...',
  'DESSERT',
  90, 30, 999,
  '[{"order":1,"text":"בצק עלים מוכן - 500 גר''"}]'::json,
  '[{"step":1,"text":"מרדדים את הבצק הקנוי..."}]'::json,
  ARRAY['קינוח', 'חלבי', 'אפייה'],
  'מתכון מדוגמה',
  'מתכון מדוגמה'
);
```

#### Data Validation
- **JSON Structure**: Proper escaping for Hebrew text in JSON fields
- **UUID Generation**: CUID-compatible IDs for primary keys
- **Type Safety**: PostgreSQL type casting (::json) for complex fields
- **Array Handling**: Native PostgreSQL ARRAY[] syntax for tags

### Performance Benefits

#### AI vs Rule-Based Comparison

| Aspect | Rule-Based Parser | AI Agent Parser |
|--------|------------------|-----------------|
| **Description Capture** | 0% success | 100% success |
| **Cultural Context** | Lost | Fully preserved |
| **Time Accuracy** | Generic defaults | Precise calculations |
| **Family Stories** | Missed entirely | Complete preservation |
| **Hebrew Nuances** | Limited | Native understanding |

### Best Practices

#### For Future Migrations
1. **Document Preparation**: Ensure Word documents have clear Hebrew text
2. **Quality Review**: Always run dry-run first to validate parsing
3. **Backup Strategy**: Keep original documents as source of truth
4. **Database Testing**: Test SQL statements in staging environment
5. **Cultural Validation**: Review AI-parsed descriptions for accuracy

#### Error Handling
- **Network Issues**: Graceful handling of database connectivity problems
- **Parsing Failures**: Comprehensive error reporting with file context
- **Validation Errors**: Schema validation before database insertion
- **Rollback Strategy**: SQL transactions for safe migration execution

### Integration with Application

The migrated recipes integrate seamlessly with the main application:
- **Hebrew RTL Support**: All text properly displays in RTL layout
- **Search Functionality**: Migrated content fully searchable
- **Category Filtering**: Automatic integration with recipe filters
- **Recipe Display**: Rich descriptions enhance user experience

### Future Enhancements

Potential improvements for the migration pipeline:
- **Batch Processing**: Support for large document collections
- **Image Extraction**: Parse embedded recipe photos from documents
- **Multi-Language**: Extend AI parsing to other languages
- **Version Control**: Track migration history and document changes
- **API Integration**: REST API for programmatic recipe imports