describe("App Startup Registration and Profile", () => {
  beforeAll(async () => {
    // we need to delete the keychain data before every run
    await device.launchApp({ delete: true });
  });

  beforeEach(async () => {
    await device.clearKeychain();
    await device.launchApp({ newInstance: true });
  });

  it("should go to login page and back to register page", async () => {
    await element(by.id("login-link")).tap();
    await expect(element(by.id("login-page"))).toBeVisible();
    await element(by.id("register-link")).tap();
    await expect(element(by.id("register-page"))).toBeVisible();
  });

  it("should register a new user and redirect to main page", async () => {
    const username = "testuser";
    const email = "testuser@example.com";
    const password = "Password123!@#";

    // register flow
    await element(by.id("username-input")).typeText(username);
    await element(by.id("email-input")).typeText(email);
    await element(by.id("password-input")).typeText(password);
    await element(by.id("password-input")).tapReturnKey();
    await element(by.id("register-button")).tap();

    // navigate to profile page
    await element(by.label("Me")).tap();
    // we should be logged in and have a username
    await expect(element(by.id("username"))).toHaveText(`@${username}`);
  });
});
