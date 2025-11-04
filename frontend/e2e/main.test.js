describe("App Startup Registration and Profile", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should have registration page elements visible", async () => {
    await expect(element(by.id("register-page"))).toBeVisible();
    await expect(element(by.id("username-input"))).toBeVisible();
    await expect(element(by.id("email-input"))).toBeVisible();
    await expect(element(by.id("password-input"))).toBeVisible();
    await expect(element(by.id("register-button"))).toBeVisible();
    await expect(element(by.id("login-link"))).toBeVisible();
  });

  it("should go to login page and back to register page", async () => {
    await element(by.id("login-link")).tap();
    await expect(element(by.id("login-page"))).toBeVisible();
    await element(by.id("register-link")).tap();
    await expect(element(by.id("register-page"))).toBeVisible();
  });
});
