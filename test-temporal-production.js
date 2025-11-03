#!/usr/bin/env node

/**
 * Test script to verify Temporal workflow functionality in production
 * Tests the complete recipe workflow including email notifications
 */

const { Client, Connection } = require('@temporalio/client');
require('dotenv').config({ path: '.env.local' });

// Test recipe data
const testRecipe = {
    title: 'מתכון בדיקה - Test Recipe',
    description: 'מתכון לבדיקת המערכת - Test recipe for system verification',
    category: 'MAIN',
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 4,
    ingredients: [
        { text: '2 כוסות קמח - 2 cups flour' },
        { text: '1 כף חמאה - 1 tbsp butter' },
        { text: '1 כוס מים - 1 cup water' }
    ],
    instructions: [
        { text: 'לערבב את כל החומרים - Mix all ingredients' },
        { text: 'לבשל במשך 30 דקות - Cook for 30 minutes' }
    ],
    tags: ['בדיקה', 'test', 'temporal'],
    createdBy: 'בדיקה אוטומטית - Automated Test',
    photoUrl: null
};

async function testTemporalWorkflow() {
    let client;
    let createdRecipeId;

    try {
        console.log('🚀 Starting Temporal workflow test...');
        console.log('🔗 Connecting to production Temporal server...');

        // Connect to production Temporal server
        // Note: The production server runs both HTTP health check (port 10000)
        // and Temporal gRPC internally on localhost:7234
        // Since we can't connect externally to the internal gRPC port,
        // we need to use the environment variables that point to the correct address
        const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7234';

        console.log(`🔗 Attempting to connect to: ${temporalAddress}`);

        const connection = await Connection.connect({
            address: temporalAddress,
            connectTimeout: '15s',
            callTimeout: '30s',
        });

        client = new Client({
            connection,
            namespace: 'default',
        });

        console.log('✅ Connected to production Temporal server');

        // Test 1: Create Recipe Workflow
        console.log('\n📝 Testing CREATE recipe workflow...');
        const createWorkflowId = `test-create-${Date.now()}`;

        const createHandle = await client.workflow.start('recipeWorkflow', {
            args: [{
                operation: 'create',
                recipeData: testRecipe,
                userEmail: 'test@example.com'
            }],
            taskQueue: 'yaels-recipes-task-queue',
            workflowId: createWorkflowId,
        });

        console.log(`⏳ Create workflow started: ${createHandle.workflowId}`);

        const createResult = await createHandle.result();
        createdRecipeId = createResult.result.id;

        console.log('✅ Create workflow completed successfully!');
        console.log(`📄 Recipe created with ID: ${createdRecipeId}`);
        console.log(`📧 Email notification should have been sent`);

        // Test 2: Update Recipe Workflow
        console.log('\n🔄 Testing UPDATE recipe workflow...');
        const updateWorkflowId = `test-update-${Date.now()}`;

        const updatedRecipe = {
            ...testRecipe,
            title: testRecipe.title + ' - עודכן - Updated',
            description: testRecipe.description + ' - עודכן בבדיקה - Updated in test'
        };

        const updateHandle = await client.workflow.start('recipeWorkflow', {
            args: [{
                operation: 'update',
                recipeId: createdRecipeId,
                recipeData: updatedRecipe,
                userEmail: 'test@example.com'
            }],
            taskQueue: 'yaels-recipes-task-queue',
            workflowId: updateWorkflowId,
        });

        console.log(`⏳ Update workflow started: ${updateHandle.workflowId}`);

        const updateResult = await updateHandle.result();

        console.log('✅ Update workflow completed successfully!');
        console.log(`📄 Recipe updated: ${updateResult.result.title}`);
        console.log(`📧 Update notification should have been sent`);

        // Test 3: Delete Recipe Workflow
        console.log('\n🗑️  Testing DELETE recipe workflow...');
        const deleteWorkflowId = `test-delete-${Date.now()}`;

        const deleteHandle = await client.workflow.start('recipeWorkflow', {
            args: [{
                operation: 'delete',
                recipeId: createdRecipeId,
                userEmail: 'test@example.com'
            }],
            taskQueue: 'yaels-recipes-task-queue',
            workflowId: deleteWorkflowId,
        });

        console.log(`⏳ Delete workflow started: ${deleteHandle.workflowId}`);

        const deleteResult = await deleteHandle.result();

        console.log('✅ Delete workflow completed successfully!');
        console.log(`📄 Recipe deleted: ${deleteResult.result.id}`);
        console.log(`📧 Delete notification should have been sent`);

        console.log('\n🎉 All Temporal workflows completed successfully!');
        console.log('📧 Check your notification emails to verify end-to-end functionality');

        // Summary
        console.log('\n📊 Test Summary:');
        console.log(`✅ CREATE workflow: ${createWorkflowId}`);
        console.log(`✅ UPDATE workflow: ${updateWorkflowId}`);
        console.log(`✅ DELETE workflow: ${deleteWorkflowId}`);
        console.log(`📄 Test recipe ID: ${createdRecipeId}`);
        console.log('\n🚀 Production deployment is working correctly!');

    } catch (error) {
        console.error('❌ Temporal workflow test failed:');
        console.error('Error:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Connection Error Solutions:');
            console.log('1. Verify the production server is running');
            console.log('2. Check the server URL and port');
            console.log('3. Ensure the worker is connected and listening');
        }

        if (error.message.includes('Workflow not found')) {
            console.log('\n🔧 Workflow Error Solutions:');
            console.log('1. Verify the worker is running and has loaded the workflows');
            console.log('2. Check the task queue name matches');
            console.log('3. Ensure workflows are properly exported');
        }

        process.exit(1);
    }
}

// Environment check
console.log('🔧 Environment Variables Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- TEMPORAL_ADDRESS:', process.env.TEMPORAL_ADDRESS || 'localhost:7234 (default)');

// Run the test
testTemporalWorkflow();