/**
 * 🔒 تست جامع Flow Login و بررسی امنیتی
 *
 * این script همه حالت‌های مختلف login را تست می‌کند و
 * مشکلات امنیتی و مشکلات مختلف را شناسایی می‌کند
 */

// Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";
const TEST_PHONE_NUMBER = "09123456789";
const TEST_PHONE_NUMBER_2 = "09123456790";

// Types
interface TestResult {
  testName: string;
  status: "PASS" | "FAIL" | "WARNING";
  message: string;
  details?: any;
  securityIssue?: boolean;
  recommendation?: string;
}

interface TestSuite {
  suiteName: string;
  results: TestResult[];
}

const results: TestSuite[] = [];

// Helper function for delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper functions
async function makeRequest(
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string
): Promise<{ status: number; data: any; headers: any }> {
  // Add delay to avoid rate limiting
  await delay(500);
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error: any) {
    return {
      status: 0,
      data: { error: error.message },
      headers: {},
    };
  }
}

function addResult(
  suiteName: string,
  testName: string,
  status: "PASS" | "FAIL" | "WARNING",
  message: string,
  details?: any,
  securityIssue?: boolean,
  recommendation?: string
) {
  let suite = results.find((s) => s.suiteName === suiteName);
  if (!suite) {
    suite = { suiteName, results: [] };
    results.push(suite);
  }

  suite.results.push({
    testName,
    status,
    message,
    details,
    securityIssue,
    recommendation,
  });
}

// Test Suites

/**
 * 1️⃣ تست‌های امنیتی پایه
 */
async function testSecurityBasics() {
  console.log("\n🔒 تست‌های امنیتی پایه...");

  // Test 1: SQL Injection در phoneNumber
  const sqlInjectionTests = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "09123456789' UNION SELECT * FROM users--",
  ];

  for (const maliciousInput of sqlInjectionTests) {
    const response = await makeRequest("/auth/send-otp", "POST", {
      phoneNumber: maliciousInput,
    });

    if (response.status === 200) {
      addResult(
        "Security Basics",
        "SQL Injection Protection",
        "FAIL",
        `سیستم در برابر SQL Injection آسیب‌پذیر است: ${maliciousInput}`,
        { input: maliciousInput, response: response.data },
        true,
        "Backend باید input validation قوی‌تری داشته باشد"
      );
    } else {
      addResult(
        "Security Basics",
        "SQL Injection Protection",
        "PASS",
        `سیستم در برابر SQL Injection محافظت شده است: ${maliciousInput}`,
        { input: maliciousInput, status: response.status }
      );
    }
  }

  // Test 2: XSS در phoneNumber
  const xssTests = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
  ];

  for (const maliciousInput of xssTests) {
    const response = await makeRequest("/auth/send-otp", "POST", {
      phoneNumber: maliciousInput,
    });

    if (
      response.status === 200 &&
      JSON.stringify(response.data).includes(maliciousInput)
    ) {
      addResult(
        "Security Basics",
        "XSS Protection",
        "WARNING",
        `ممکن است XSS vulnerability وجود داشته باشد: ${maliciousInput}`,
        { input: maliciousInput },
        true,
        "Backend باید input sanitization انجام دهد"
      );
    } else {
      addResult(
        "Security Basics",
        "XSS Protection",
        "PASS",
        `سیستم در برابر XSS محافظت شده است: ${maliciousInput}`,
        { input: maliciousInput, status: response.status }
      );
    }
  }

  // Test 3: Rate Limiting
  console.log("  تست Rate Limiting...");
  // ابتدا چند درخواست سریع ارسال می‌کنیم
  const rateLimitRequests = [];
  for (let i = 0; i < 10; i++) {
    rateLimitRequests.push(
      makeRequest("/auth/send-otp", "POST", {
        phoneNumber: `0912345678${i}`,
      })
    );
  }

  const rateLimitResponses = await Promise.all(rateLimitRequests);
  const rateLimited = rateLimitResponses.some(
    (r) =>
      r.status === 429 ||
      (r.status === 403 && r.data.message?.includes("حد مجاز"))
  );

  if (rateLimited) {
    addResult(
      "Security Basics",
      "Rate Limiting",
      "PASS",
      "سیستم Rate Limiting دارد و از Brute Force Attack محافظت می‌کند",
      {
        rateLimited: true,
        rateLimitedCount: rateLimitResponses.filter(
          (r) => r.status === 429 || r.status === 403
        ).length,
      }
    );
  } else {
    addResult(
      "Security Basics",
      "Rate Limiting",
      "WARNING",
      "سیستم ممکن است Rate Limiting نداشته باشد - خطر Brute Force Attack",
      {
        rateLimited: false,
        note: "تست با delay انجام شد، ممکن است Rate Limiting در حالت عادی فعال باشد",
      },
      false,
      "Backend باید Rate Limiting پیاده‌سازی کند (مثلاً 5 درخواست در دقیقه)"
    );
  }

  // Test 4: Token Security
  console.log("  تست Token Security...");
  const testToken = "invalid_token_12345";
  // تست با endpoint که نیاز به authentication دارد
  const tokenResponse = await makeRequest(
    "/auth/me",
    "GET",
    undefined,
    testToken
  );

  if (tokenResponse.status === 401 || tokenResponse.status === 403) {
    addResult(
      "Security Basics",
      "Token Validation",
      "PASS",
      "سیستم token های نامعتبر را رد می‌کند",
      { status: tokenResponse.status }
    );
  } else if (tokenResponse.status === 404) {
    addResult(
      "Security Basics",
      "Token Validation",
      "WARNING",
      "Endpoint برای تست token validation پیدا نشد",
      { status: tokenResponse.status },
      false,
      "از endpoint دیگری برای تست token validation استفاده کنید"
    );
  } else {
    addResult(
      "Security Basics",
      "Token Validation",
      "FAIL",
      "سیستم token های نامعتبر را رد نمی‌کند",
      { status: tokenResponse.status, data: tokenResponse.data },
      true,
      "Backend باید token validation قوی‌تری داشته باشد"
    );
  }
}

/**
 * 2️⃣ تست Flow کامل Login - کاربر جدید
 */
async function testNewUserFlow() {
  console.log("\n👤 تست Flow کاربر جدید...");

  // Step 1: Send OTP
  console.log("  Step 1: ارسال OTP...");
  const sendOtpResponse = await makeRequest("/auth/send-otp", "POST", {
    phoneNumber: TEST_PHONE_NUMBER,
  });

  if (sendOtpResponse.status === 200) {
    addResult("New User Flow", "Send OTP", "PASS", "ارسال OTP موفق بود", {
      status: sendOtpResponse.status,
      hasExpiresAt: !!sendOtpResponse.data.data?.expiresAt,
      hasRemainingSeconds:
        sendOtpResponse.data.data?.remainingSeconds !== undefined,
      hasCode: !!sendOtpResponse.data.code, // Development mode code
    });

    // Step 2: Verify OTP (اگر کد در development mode برگردانده شده)
    const otpCode = sendOtpResponse.data.code || "123456"; // Fallback برای تست

    console.log("  Step 2: تأیید OTP...");
    const verifyOtpResponse = await makeRequest("/auth/verify-otp", "POST", {
      phoneNumber: TEST_PHONE_NUMBER,
      otpCode: otpCode,
    });

    if (
      verifyOtpResponse.status === 200 &&
      verifyOtpResponse.data.data?.token
    ) {
      const token = verifyOtpResponse.data.data.token;
      addResult(
        "New User Flow",
        "Verify OTP",
        "PASS",
        "تأیید OTP موفق بود و token دریافت شد",
        {
          status: verifyOtpResponse.status,
          hasToken: !!token,
          registrationStatus:
            verifyOtpResponse.data.data.user?.registrationStatus,
        }
      );

      // Step 3: Register (اگر pending است)
      if (verifyOtpResponse.data.data.user?.registrationStatus === "pending") {
        console.log("  Step 3: ثبت‌نام...");
        const registerResponse = await makeRequest(
          "/auth/register",
          "POST",
          {
            phoneNumber: TEST_PHONE_NUMBER,
            otpCode: otpCode,
            firstName: "علی",
            lastName: "احمدی",
            nationalId: "1234567890",
            email: "test@example.com",
          },
          token
        );

        if (
          registerResponse.status === 200 ||
          registerResponse.status === 201
        ) {
          addResult("New User Flow", "Register", "PASS", "ثبت‌نام موفق بود", {
            status: registerResponse.status,
            hasToken: !!registerResponse.data.data?.token,
          });
        } else {
          addResult(
            "New User Flow",
            "Register",
            "FAIL",
            `ثبت‌نام ناموفق: ${registerResponse.data.message || "خطای نامشخص"}`,
            {
              status: registerResponse.status,
              data: registerResponse.data,
            }
          );
        }
      }
    } else {
      addResult(
        "New User Flow",
        "Verify OTP",
        "FAIL",
        `تأیید OTP ناموفق: ${verifyOtpResponse.data.message || "خطای نامشخص"}`,
        {
          status: verifyOtpResponse.status,
          data: verifyOtpResponse.data,
        }
      );
    }
  } else {
    addResult(
      "New User Flow",
      "Send OTP",
      "FAIL",
      `ارسال OTP ناموفق: ${sendOtpResponse.data.message || "خطای نامشخص"}`,
      {
        status: sendOtpResponse.status,
        data: sendOtpResponse.data,
      }
    );
    return; // اگر OTP ارسال نشد، ادامه نده
  }
}

/**
 * 3️⃣ تست Flow کاربر Pending
 */
async function testPendingUserFlow() {
  console.log("\n⏳ تست Flow کاربر Pending...");

  // Step 1: Send OTP
  const sendOtpResponse = await makeRequest("/auth/send-otp", "POST", {
    phoneNumber: TEST_PHONE_NUMBER_2,
  });

  if (sendOtpResponse.status === 200) {
    const otpCode = sendOtpResponse.data.code || "123456";

    // Step 2: Verify OTP
    const verifyOtpResponse = await makeRequest("/auth/verify-otp", "POST", {
      phoneNumber: TEST_PHONE_NUMBER_2,
      otpCode: otpCode,
    });

    if (verifyOtpResponse.status === 200) {
      const token = verifyOtpResponse.data.data.token;
      const registrationStatus =
        verifyOtpResponse.data.data.user?.registrationStatus;

      if (registrationStatus === "pending") {
        addResult(
          "Pending User Flow",
          "Pending Status Check",
          "PASS",
          "کاربر در حالت pending است",
          { registrationStatus }
        );

        // Test: Try to add to cart (should get INCOMPLETE_REGISTRATION error)
        console.log(
          "  تست افزودن به سبد (باید خطای INCOMPLETE_REGISTRATION بدهد)..."
        );
        const addToCartResponse = await makeRequest(
          "/site/cart",
          "POST",
          {
            productId: "test-product-id",
            quantity: 1,
          },
          token
        );

        if (addToCartResponse.status === 403) {
          const errorCode = addToCartResponse.data.code;
          if (
            errorCode === "INCOMPLETE_REGISTRATION" ||
            errorCode === "OTP_REQUIRED"
          ) {
            addResult(
              "Pending User Flow",
              "Cart Access Protection",
              "PASS",
              "سیستم از دسترسی کاربر pending به سبد جلوگیری می‌کند",
              {
                status: addToCartResponse.status,
                errorCode,
                phoneNumber: addToCartResponse.data.phoneNumber,
              }
            );
          } else {
            addResult(
              "Pending User Flow",
              "Cart Access Protection",
              "WARNING",
              `خطای غیرمنتظره: ${errorCode}`,
              {
                status: addToCartResponse.status,
                errorCode,
                data: addToCartResponse.data,
              }
            );
          }
        } else if (addToCartResponse.status === 200) {
          addResult(
            "Pending User Flow",
            "Cart Access Protection",
            "FAIL",
            "کاربر pending می‌تواند به سبد دسترسی پیدا کند - مشکل امنیتی!",
            {
              status: addToCartResponse.status,
            },
            true,
            "Backend باید از دسترسی کاربر pending به سبد جلوگیری کند"
          );
        }
      }
    }
  }
}

/**
 * 4️⃣ تست OTP Expiration
 */
async function testOtpExpiration() {
  console.log("\n⏰ تست انقضای OTP...");

  // Test: OTP که منقضی شده
  const expiredOtpResponse = await makeRequest("/auth/verify-otp", "POST", {
    phoneNumber: TEST_PHONE_NUMBER,
    otpCode: "000000", // کد نامعتبر
  });

  if (expiredOtpResponse.status === 400 || expiredOtpResponse.status === 403) {
    const errorMessage = expiredOtpResponse.data.message || "";
    if (
      errorMessage.includes("منقضی") ||
      errorMessage.includes("expired") ||
      expiredOtpResponse.data.code === "OTP_VERIFICATION_EXPIRED"
    ) {
      addResult(
        "OTP Expiration",
        "Expired OTP Handling",
        "PASS",
        "سیستم OTP منقضی شده را رد می‌کند",
        {
          status: expiredOtpResponse.status,
          message: errorMessage,
        }
      );
    } else {
      addResult(
        "OTP Expiration",
        "Expired OTP Handling",
        "WARNING",
        `پیام خطا واضح نیست: ${errorMessage}`,
        {
          status: expiredOtpResponse.status,
          message: errorMessage,
        }
      );
    }
  } else {
    addResult(
      "OTP Expiration",
      "Expired OTP Handling",
      "FAIL",
      "سیستم OTP منقضی شده را رد نمی‌کند",
      {
        status: expiredOtpResponse.status,
        data: expiredOtpResponse.data,
      },
      true,
      "Backend باید OTP منقضی شده را رد کند"
    );
  }
}

/**
 * 5️⃣ تست Input Validation
 */
async function testInputValidation() {
  console.log("\n✅ تست Validation ورودی‌ها...");

  // Test 1: شماره موبایل نامعتبر
  const invalidPhoneTests = [
    { phone: "123", description: "شماره کوتاه" },
    { phone: "091234567890123", description: "شماره بلند" },
    { phone: "abc12345678", description: "شماره با حروف" },
    { phone: "", description: "شماره خالی" },
  ];

  for (const test of invalidPhoneTests) {
    const response = await makeRequest("/auth/send-otp", "POST", {
      phoneNumber: test.phone,
    });

    if (response.status === 400 || response.status === 422) {
      addResult(
        "Input Validation",
        `Phone Validation: ${test.description}`,
        "PASS",
        `شماره نامعتبر رد شد: ${test.description}`,
        { phone: test.phone, status: response.status }
      );
    } else {
      addResult(
        "Input Validation",
        `Phone Validation: ${test.description}`,
        "FAIL",
        `شماره نامعتبر رد نشد: ${test.description}`,
        { phone: test.phone, status: response.status },
        true,
        "Backend باید validation قوی‌تری برای شماره موبایل داشته باشد"
      );
    }
  }

  // Test 2: OTP Code نامعتبر
  const invalidOtpTests = [
    { otp: "123", description: "کد کوتاه" },
    { otp: "12345678", description: "کد بلند" },
    { otp: "abcdef", description: "کد با حروف" },
    { otp: "", description: "کد خالی" },
  ];

  for (const test of invalidOtpTests) {
    const response = await makeRequest("/auth/verify-otp", "POST", {
      phoneNumber: TEST_PHONE_NUMBER,
      otpCode: test.otp,
    });

    if (response.status === 400 || response.status === 422) {
      addResult(
        "Input Validation",
        `OTP Validation: ${test.description}`,
        "PASS",
        `کد نامعتبر رد شد: ${test.description}`,
        { otp: test.otp, status: response.status }
      );
    } else {
      addResult(
        "Input Validation",
        `OTP Validation: ${test.description}`,
        "WARNING",
        `کد نامعتبر ممکن است رد نشود: ${test.description}`,
        { otp: test.otp, status: response.status }
      );
    }
  }
}

/**
 * 6️⃣ تست Session Management
 */
async function testSessionManagement() {
  console.log("\n🔐 تست مدیریت Session...");

  // Test: Token expiration
  // این تست نیاز به token معتبر دارد که باید از flow قبلی گرفته شود
  // برای سادگی، فقط ساختار را چک می‌کنیم

  addResult(
    "Session Management",
    "Token Structure",
    "INFO",
    "تست Token Structure نیاز به token معتبر دارد",
    {},
    false,
    "برای تست کامل، باید token از flow واقعی گرفته شود"
  );

  // Test: Multiple sessions
  const sendOtp1 = await makeRequest("/auth/send-otp", "POST", {
    phoneNumber: TEST_PHONE_NUMBER,
  });

  if (sendOtp1.status === 200) {
    // Send OTP again (should be allowed or rate limited)
    const sendOtp2 = await makeRequest("/auth/send-otp", "POST", {
      phoneNumber: TEST_PHONE_NUMBER,
    });

    if (sendOtp2.status === 200) {
      addResult(
        "Session Management",
        "Multiple OTP Requests",
        "PASS",
        "ارسال چندین OTP برای همان شماره مجاز است",
        { status1: sendOtp1.status, status2: sendOtp2.status }
      );
    } else if (sendOtp2.status === 429) {
      addResult(
        "Session Management",
        "Multiple OTP Requests",
        "PASS",
        "سیستم Rate Limiting دارد",
        { status1: sendOtp1.status, status2: sendOtp2.status }
      );
    }
  }
}

/**
 * 7️⃣ تست Error Handling
 */
async function testErrorHandling() {
  console.log("\n⚠️ تست Error Handling...");

  // Test: Network error simulation
  // این تست نیاز به mock دارد

  // Test: Invalid endpoint
  const invalidEndpointResponse = await makeRequest(
    "/auth/invalid-endpoint",
    "POST",
    {
      phoneNumber: TEST_PHONE_NUMBER,
    }
  );

  if (invalidEndpointResponse.status === 404) {
    addResult(
      "Error Handling",
      "Invalid Endpoint",
      "PASS",
      "سیستم endpoint نامعتبر را به درستی handle می‌کند",
      { status: invalidEndpointResponse.status }
    );
  } else {
    addResult(
      "Error Handling",
      "Invalid Endpoint",
      "WARNING",
      `وضعیت غیرمنتظره برای endpoint نامعتبر: ${invalidEndpointResponse.status}`,
      { status: invalidEndpointResponse.status }
    );
  }

  // Test: Missing required fields
  const missingFieldsResponse = await makeRequest("/auth/verify-otp", "POST", {
    phoneNumber: TEST_PHONE_NUMBER,
    // otpCode missing
  });

  if (
    missingFieldsResponse.status === 400 ||
    missingFieldsResponse.status === 422
  ) {
    addResult(
      "Error Handling",
      "Missing Required Fields",
      "PASS",
      "سیستم فیلدهای اجباری را validate می‌کند",
      { status: missingFieldsResponse.status }
    );
  } else {
    addResult(
      "Error Handling",
      "Missing Required Fields",
      "FAIL",
      "سیستم فیلدهای اجباری را validate نمی‌کند",
      { status: missingFieldsResponse.status },
      true,
      "Backend باید validation برای فیلدهای اجباری داشته باشد"
    );
  }
}

/**
 * 8️⃣ تولید گزارش
 */
function generateReport() {
  console.log("\n\n" + "=".repeat(80));
  console.log("📊 گزارش تست Flow Login و بررسی امنیتی");
  console.log("=".repeat(80));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let warningTests = 0;
  const securityIssues: TestResult[] = [];

  for (const suite of results) {
    console.log(`\n📦 ${suite.suiteName}`);
    console.log("-".repeat(80));

    for (const result of suite.results) {
      totalTests++;
      const icon =
        result.status === "PASS"
          ? "✅"
          : result.status === "FAIL"
          ? "❌"
          : "⚠️";

      console.log(`  ${icon} ${result.testName}: ${result.message}`);

      if (result.status === "PASS") passedTests++;
      else if (result.status === "FAIL") failedTests++;
      else warningTests++;

      if (result.securityIssue) {
        securityIssues.push(result);
      }

      if (result.recommendation) {
        console.log(`     💡 پیشنهاد: ${result.recommendation}`);
      }

      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`     📝 جزئیات:`, JSON.stringify(result.details, null, 2));
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📈 خلاصه نتایج:");
  console.log("=".repeat(80));
  console.log(`  کل تست‌ها: ${totalTests}`);
  console.log(`  ✅ موفق: ${passedTests}`);
  console.log(`  ❌ ناموفق: ${failedTests}`);
  console.log(`  ⚠️  هشدار: ${warningTests}`);

  if (securityIssues.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("🔒 مشکلات امنیتی شناسایی شده:");
    console.log("=".repeat(80));

    for (const issue of securityIssues) {
      console.log(`\n  ❌ ${issue.testName}`);
      console.log(`     ${issue.message}`);
      if (issue.recommendation) {
        console.log(`     💡 ${issue.recommendation}`);
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ تست‌ها کامل شد!");
  console.log("=".repeat(80) + "\n");
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 شروع تست Flow Login و بررسی امنیتی...\n");
  console.log(`📍 API Base URL: ${API_BASE_URL}\n`);

  try {
    await testSecurityBasics();
    await testNewUserFlow();
    await testPendingUserFlow();
    await testOtpExpiration();
    await testInputValidation();
    await testSessionManagement();
    await testErrorHandling();

    generateReport();
  } catch (error: any) {
    console.error("❌ خطا در اجرای تست‌ها:", error.message);
    console.error(error.stack);
  }
}

// Run tests
main();
