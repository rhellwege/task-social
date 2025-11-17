describe("App Startup Registration and Profile", () => {
  const username = "testuser";
  const email = "testuser@example.com";
  const password = "Password123!@#";

  beforeAll(async () => {
    // delete the app off the simulator if it already exists
    await device.launchApp({ delete: true });
  });

  beforeEach(async () => {
    // we need to delete the keychain data before every run
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

  // Login flow (depends on register flow)
  it("should login with registered user and redirect to main page", async () => {
    // our test clears the keychain so we will start on the register page.
    // navigate to login page
    await element(by.id("login-link")).tap();
    await expect(element(by.id("login-page"))).toBeVisible();
    // login flow
    await element(by.id("email-input")).typeText(email);
    await element(by.id("password-input")).typeText(password);
    await element(by.id("password-input")).tapReturnKey();
    await element(by.id("login-button")).tap();

    // navigate to profile page
    await element(by.label("Me")).tap();
    // we should be logged in and have a username
    await expect(element(by.id("username"))).toHaveText(`@${username}`);
  });
});

describe("App Navigation", () => {
  const username = "testuser";
  const email = "testuser@example.com";
  const password = "Password123!@#";
  beforeAll(async () => {
    // delete the app off the simulator if it already exists
    await device.launchApp({ delete: true });
  });
  beforeEach(async () => {
    // we need to delete the keychain data before every run
    await device.clearKeychain();
    await device.launchApp({ newInstance: true });
  });
  it("should register a new user and move between pages", async () => {
    // register flow
    await element(by.id("username-input")).typeText(username);
    await element(by.id("email-input")).typeText(email);
    await element(by.id("password-input")).typeText(password);
    await element(by.id("password-input")).tapReturnKey();
    await element(by.id("register-button")).tap();

    // navigate to Clubs
    await element(by.label("Clubs")).tap();
    await expect(element(by.id("clubs-screen"))).toBeVisible();
    // navigate to Profile
    await element(by.label("Me")).tap();
    await expect(element(by.id("profile-screen"))).toBeVisible();
    // navigate to Explore
    await element(by.label("Explore")).tap();
    await expect(element(by.id("index-screen"))).toBeVisible();
  });
});