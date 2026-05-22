import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost';

test.describe.serial('Health Horizon Core E2E Verification', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));
  });

  const timestamp = Date.now();
  const testPatient = {
    email: `p_${timestamp}@example.com`,
    password: 'Password123!',
    fullName: 'Test Patient',
    age: '25',
    gender: 'MALE',
    height: '178',
    weight: '72',
    healthGoal: 'Better Sleep'
  };

  const testDoctor = {
    email: `d_${timestamp}@example.com`,
    password: 'Password123!',
    fullName: 'Test Assistant',
    specialization: 'Cardiology',
    experienceYears: '8',
    consultationFee: '120',
    bio: 'Professional cardiologist since 2018.'
  };

  test('Patient E2E: Register, Profile, Dashboard', async ({ page }) => {
    // 1. Register
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="fullName"]', testPatient.fullName);
    await page.fill('input[name="email"]', testPatient.email);
    await page.fill('input[name="password"]', testPatient.password);
    await page.selectOption('select[name="role"]', 'PATIENT');
    await page.click('button[type="submit"]');

    // Wait for redirect to complete-profile
    await expect(page).toHaveURL(/complete-profile/, { timeout: 15000 });

    // 2. Complete Profile Step 1
    await page.fill('input[name="fullName"]', testPatient.fullName);
    await page.fill('input[name="age"]', testPatient.age);
    await page.selectOption('select[name="gender"]', { label: 'Male' });
    await page.fill('input[name="height"]', testPatient.height);
    await page.fill('input[name="weight"]', testPatient.weight);
    
    // Using handleNext which is triggered by button click
    await expect(page.locator('button:has-text("Continue")')).toBeEnabled();
    await page.click('button:has-text("Continue")');

    // 3. Complete Profile Step 2 (Health Goal)
    await page.click(`button:has-text("${testPatient.healthGoal}")`);
    await page.click('button:has-text("Complete Registration")');

    // 4. Dashboard Verification
    await expect(page).toHaveURL(/patient\/dashboard/);
    await expect(page.locator('h2')).toContainText(/Hello/);
    
    // Check BMI calculation (72 / (1.78 * 1.78) = 22.7)
    await expect(page.locator('text=22.7')).toBeVisible({ timeout: 10000 });
  });

  test('Doctor E2E: Register, Profile, Dashboard', async ({ page }) => {
    // 1. Register
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="fullName"]', testDoctor.fullName);
    await page.fill('input[name="email"]', testDoctor.email);
    await page.fill('input[name="password"]', testDoctor.password);
    await page.selectOption('select[name="role"]', 'DOCTOR');
    await page.selectOption('select[name="specialization"]', testDoctor.specialization);
    await page.click('button[type="submit"]');

    // Wait for redirect to complete-profile
    await expect(page).toHaveURL(/complete-profile/, { timeout: 15000 });

    // 2. Complete Profile Step 1 (Generic)
    await page.fill('input[name="fullName"]', testDoctor.fullName);
    await page.fill('input[name="age"]', '40');
    await page.selectOption('select[name="gender"]', 'MALE');
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="weight"]', '70');
    await page.click('button:has-text("Continue")');

    // 3. Complete Profile Step 2 (Doctor specific)
    await page.fill('input[name="experienceYears"]', testDoctor.experienceYears);
    await page.fill('input[name="consultationFee"]', testDoctor.consultationFee);
    await page.fill('textarea[name="bio"]', testDoctor.bio);
    await page.click('button:has-text("Complete Registration")');

    // 4. Dashboard Verification
    await expect(page).toHaveURL(/doctor\/dashboard/);
    await expect(page.locator('h2')).toContainText(/Welcome/);
    await expect(page.locator(`text=${testDoctor.specialization}`)).toBeVisible();
  });

  test('Doctor Search and Results UI', async ({ page }) => {
    // Need a logged in session
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', testPatient.email);
    await page.fill('input[name="password"]', testPatient.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/patient\/dashboard/);
    
    // Go to search
    await page.goto(`${BASE_URL}/patient/search`);
    await expect(page.locator('h2')).toContainText(/Find a Specialist/);
    
    // Check results present
    await expect(page.locator('.group').first()).toBeVisible({ timeout: 10000 });
    
    // Verify specific doctor (should see the recently registered one)
    await expect(page.locator(`text=${testDoctor.fullName}`).first()).toBeVisible();
    await expect(page.locator(`text=${testDoctor.consultationFee}`).first()).toBeVisible();
    await expect(page.locator(`text=${testDoctor.experienceYears}`).first()).toBeVisible();
  });
});
