import fs from "node:fs";

const reportPaths = process.argv.slice(2);

if (reportPaths.length === 0) {
  console.error("Usage: node scripts/check-lighthouse-reports.mjs <report.json> [...]");
  process.exit(1);
}

const thresholds = {
  mobile: { performance: 0.75, tbt: 800 },
  desktop: { performance: 0.9, tbt: 300 },
};

let failed = false;

for (const reportPath of reportPaths) {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const mode = /desktop/i.test(reportPath) ? "desktop" : "mobile";
  const threshold = thresholds[mode];
  const performance = report.categories?.performance?.score;
  const tbt = report.audits?.["total-blocking-time"]?.numericValue;

  if (typeof performance !== "number" || typeof tbt !== "number") {
    console.error("Lighthouse report is missing performance/TBT metrics: " + reportPath);
    failed = true;
    continue;
  }

  const performancePercent = Math.round(performance * 100);
  const tbtMs = Math.round(tbt);
  console.log(mode + ": performance=" + performancePercent + " TBT=" + tbtMs + "ms (" + reportPath + ")");

  if (performance < threshold.performance) {
    console.error("Performance score is below " + Math.round(threshold.performance * 100) + ": " + reportPath);
    failed = true;
  }
  if (tbt > threshold.tbt) {
    console.error("TBT is above " + threshold.tbt + "ms: " + reportPath);
    failed = true;
  }
}

if (failed) process.exit(1);

      - name: Lighthouse على نسخة الإنتاج (موبايل + سطح مكتب)
        run: |
          mkdir -p lighthouse
          npx --yes lighthouse@12.8.2 https://ismailahmednaguib.vercel.app/ar --output=json --output-path=./lighthouse/ar-mobile.json --chrome-flags="--headless=new --no-sandbox" --quiet
          npx --yes lighthouse@12.8.2 https://ismailahmednaguib.vercel.app/ar --preset=desktop --output=json --output-path=./lighthouse/ar-desktop.json --chrome-flags="--headless=new --no-sandbox" --quiet
          node scripts/check-lighthouse-reports.mjs lighthouse/ar-mobile.json lighthouse/ar-desktop.json

      - name: حفظ تقارير Lighthouse
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-production
          path: lighthouse/
          if-no-files-found: ignore
