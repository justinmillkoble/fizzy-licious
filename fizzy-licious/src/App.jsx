import { useState, useEffect, useMemo } from "react";
import "./App.css";

const KONAMI_CODE = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
const CONFETTI_COLORS = ["#94ad61","#aa3bff","#f1963a","#4a7a62","#c084fc","#f59e0b","#34d399"];
const MYEBMS_APPS = ["MyCustomers","MyDispatch","MyInventory","MyJobs","MyOrders","MyProposals","MyTasks","MyTimeClock","Main app/multiple/other"];
const API_ACTIONS = ["GET","POST","PATCH","DELETE","Unknown"];
const API_STATUS_CODES = ["200","401","403","404","422","500","502","504","Other"];
const BRAD_PRODUCTS = ["MyEBMS","Field Service Pro"];

export default function BugTrackFormMockup() {
  const config = {
    productCategories: ["EBMS", "MyEBMS", "Field Service Pro", "WEB"],
    workstationTypes: ["Workstation", "Server"],
    boardMap: {
      EBMS: "03f8h3jzo5a72vyv1nn1lqr3b",
      MyEBMS: "03f8ogxdcurv55ieu67ufw54m",
      "Field Service Pro": "03f8ogxdcurv55ieu67ufw54m",
      WEB: "03f5ft2t7sn9h4o4a8sgibvqx",
    },
    helpLinks: {
      archivalTool: "https://handsomely-numeric-b73.notion.site/Archiving-and-Exporting-Data-34581a3c209180948739ce422533e9cc?source=copy_link",
      dumpFiles: "http://boggle.eshcom.com:56565/?q=node/2961",
    },
  };

  const [openSections, setOpenSections] = useState({
    context: true,
    environment: false,
    reproduction: false,
    attachments: false,
    details: false,
    screenshots: false,
    faq: false,
    preview: false,
  });

  const [screenshots, setScreenshots] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [konamiBuffer, setKonamiBuffer] = useState([]);
  const [konamiActive, setKonamiActive] = useState(false);
  const [titleClicks, setTitleClicks] = useState(0);
  const [bubblesActive, setBubblesActive] = useState(false);

  const isFridayAfternoon = useMemo(() => {
    const now = new Date();
    return now.getDay() === 5 && now.getHours() >= 15;
  }, []);

  const confettiPieces = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${Math.random() * 1.5}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
    })), []);

  const bubblePieces = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      left: `${10 + i * 11}%`,
      delay: `${i * 0.12}s`,
      size: `${1.1 + (i % 3) * 0.35}rem`,
    })), []);

  useEffect(() => {
    function onKeyDown(e) {
      setKonamiBuffer(prev => {
        const next = [...prev, e.key].slice(-KONAMI_CODE.length);
        if (next.join() === KONAMI_CODE.join()) {
          setKonamiActive(true);
          setTimeout(() => setKonamiActive(false), 4000);
        }
        return next;
      });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleTitleClick() {
    setTitleClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setBubblesActive(true);
        setTimeout(() => setBubblesActive(false), 3000);
        return 0;
      }
      return next;
    });
  }

  const allowedDomains = ["koblesystems.com", "lumetrasolutions.ca", "ebmscanada.com"];

  const [formData, setFormData] = useState({
    // Always present
    salesforceLink: "",
    submitterEmail: localStorage.getItem("submitterEmail") || "",
    productCategory: "",
    priority: "",
    customer: "",
    // EBMS only
    version: "",
    // Brad's products: Context
    briefSummary: "",
    // MyEBMS sub-type
    myEbmsSubType: "",
    // MyEBMS Apps
    myEbmsApp: "",
    myEbmsAppOther: "",
    // MyEBMS API Call
    apiDescription: "",
    apiAction: "",
    apiUrl: "",
    apiRequestBody: "",
    apiStatusCode: "",
    apiStatusCodeOther: "",
    apiResponseBody: "",
    // MyEBMS Server Instance
    serverDescription: "",
    serverVideoLink: "",
    serverImageLink: "",
    // Field Service Pro
    syncErrors: "",
    // Bugtrack fields (MyEBMS Apps + Field Service Pro)
    btSerialNumbers: "",
    btReproducible: false,
    btSteps: "",
    btObservedBehavior: "",
    btExpectedBehavior: "",
    btMediaLink: "",
    btDataSetLink: "",
    btDescription: "",
    // EBMS / WEB
    machineType: "",
    operatingSystem: "",
    problemDescr: "",
    reproducible: "",
    steps: "",
    observedBehavior: "",
    expectedBehavior: "",
    dataLink: "",
    anyData: false,
    videoLink: "",
    dumpFilesLink: "",
  });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (name === "submitterEmail") localStorage.setItem("submitterEmail", value);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (isSubmitted) setIsSubmitted(false);
  }

  function toggleSection(sectionName) {
    setOpenSections((prev) => {
      const isOpening = !prev[sectionName];
      if (isOpening) {
        const allClosed = Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {});
        return { ...allClosed, [sectionName]: true };
      }
      return { ...prev, [sectionName]: false };
    });
  }

  const isBradsProduct = BRAD_PRODUCTS.includes(formData.productCategory);

  function getBugtrakStatus() {
    if (formData.btReproducible) {
      const fields = ["btSteps", "btObservedBehavior", "btExpectedBehavior"];
      const filled = fields.filter((f) => formData[f]?.trim()).length;
      return { filled, total: fields.length, optional: false };
    }
    const filled = [formData.btDescription.trim(), formData.btMediaLink.trim()].filter(Boolean).length;
    return { filled, total: 2, optional: false };
  }

  function getSectionStatus(sectionKey) {
    switch (sectionKey) {
      case "context": {
        const fields = ["productCategory", "priority", "customer"];
        if (formData.productCategory === "EBMS") fields.push("version");
        if (isBradsProduct) fields.push("briefSummary");
        if (formData.productCategory === "MyEBMS") fields.push("myEbmsSubType");
        if (formData.productCategory === "MyEBMS" && formData.myEbmsSubType === "MyEBMS Apps") fields.push("myEbmsApp");
        const filled = fields.filter((f) => formData[f]?.trim?.() || formData[f]).length;
        return { filled, total: fields.length, optional: false };
      }
      case "environment": {
        const fields = ["machineType", "operatingSystem"];
        const filled = fields.filter((f) => formData[f]).length;
        return { filled, total: fields.length, optional: true };
      }
      case "reproduction": {
        const fields = ["problemDescr", "reproducible", "observedBehavior", "expectedBehavior"];
        const filled = fields.filter((f) => formData[f]?.trim?.() || formData[f]).length;
        return { filled, total: fields.length, optional: false };
      }
      case "attachments": {
        const fields = ["dataLink", "videoLink", "dumpFilesLink"];
        const filled = fields.filter((f) => formData[f]?.trim()).length + (formData.anyData ? 1 : 0);
        return { filled, total: fields.length + 1, optional: true };
      }
      case "details": {
        if (formData.productCategory === "MyEBMS") {
          if (!formData.myEbmsSubType) return null;
          if (formData.myEbmsSubType === "MyEBMS API Call") {
            const fields = ["apiAction", "apiUrl", "apiRequestBody", "apiStatusCode", "apiResponseBody"];
            const filled = fields.filter((f) => formData[f]?.trim?.() || formData[f]).length;
            return { filled, total: fields.length, optional: false };
          }
          if (formData.myEbmsSubType === "MyEBMS Server Instance") {
            return { filled: formData.serverDescription.trim() ? 1 : 0, total: 1, optional: false };
          }
          return getBugtrakStatus();
        }
        if (formData.productCategory === "Field Service Pro") return getBugtrakStatus();
        return null;
      }
      case "screenshots":
        return { filled: screenshots.length, total: null, optional: true };
      default:
        return null;
    }
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const newItems = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setScreenshots((prev) => [...prev, ...newItems]);
  }

  const [isDragOver, setIsDragOver] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const newItems = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setScreenshots((prev) => [...prev, ...newItems]);
  }

  function handlePaste(event) {
    const items = event.clipboardData?.items || [];
    const pastedImages = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) pastedImages.push({ file, previewUrl: URL.createObjectURL(file) });
      }
    }
    if (pastedImages.length > 0) {
      event.preventDefault();
      setScreenshots((prev) => [...prev, ...pastedImages]);
    }
  }

  function removeScreenshot(indexToRemove) {
    setScreenshots((prev) => {
      const item = prev[indexToRemove];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMultiline(value) {
    return escapeHtml(value).replace(/\n/g, "<br>");
  }

  function row(label, value) {
    if (!value) return "";
    return `<p style="margin:4px 0;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
  }

  function block(label, value) {
    if (!value) return "";
    return `<p style="margin:8px 0 2px 0;"><strong>${escapeHtml(label)}:</strong></p><p style="margin:0 0 6px 0;">${formatMultiline(value)}</p>`;
  }

  function codeBlock(label, value) {
    if (!value) return "";
    return `<p style="margin:8px 0 2px 0;"><strong>${escapeHtml(label)}:</strong></p><pre style="background:#f4f7f5;padding:10px;border-radius:6px;overflow-x:auto;margin:0 0 6px 0;">${escapeHtml(value)}</pre>`;
  }

  function link(href, label) {
    if (!href) return "";
    return `<p style="margin:4px 0;"><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></p>`;
  }

  function validateBugtrak(e) {
    if (formData.btReproducible) {
      if (!formData.btSteps.trim()) e.btSteps = "Steps are required.";
      if (!formData.btObservedBehavior.trim()) e.btObservedBehavior = "Observed behavior is required.";
      if (!formData.btExpectedBehavior.trim()) e.btExpectedBehavior = "Expected behavior is required.";
    } else {
      if (!formData.btDescription.trim()) e.btDescription = "Description of problem is required.";
      if (!formData.btMediaLink.trim()) e.btMediaLink = "Video or image link is required.";
    }
  }

  function validate() {
    const e = {};

    if (!formData.submitterEmail.trim()) {
      e.submitterEmail = "Email is required.";
    } else {
      const domain = formData.submitterEmail.trim().split("@")[1]?.toLowerCase();
      if (!allowedDomains.includes(domain)) {
        e.submitterEmail = `Email must be from: ${allowedDomains.join(", ")}`;
      }
    }
    if (!formData.productCategory) e.productCategory = "Product category is required.";
    if (!formData.priority) e.priority = "Priority is required.";
    if (!formData.customer.trim()) e.customer = "Customer is required.";

    if (isBradsProduct && !formData.briefSummary.trim()) e.briefSummary = "Brief summary is required.";

    if (formData.productCategory === "EBMS" && !formData.version.trim()) e.version = "Version is required for EBMS.";

    if (!isBradsProduct) {
      if (!formData.problemDescr.trim()) e.problemDescr = "Description of problem is required.";
      if (!formData.reproducible) e.reproducible = "Please select whether this is reproducible.";
      if (!formData.observedBehavior.trim()) e.observedBehavior = "Observed behavior is required.";
      if (!formData.expectedBehavior.trim()) e.expectedBehavior = "Expected behavior is required.";
    }

    if (formData.productCategory === "MyEBMS") {
      if (!formData.myEbmsSubType) e.myEbmsSubType = "Please select a type.";

      if (formData.myEbmsSubType === "MyEBMS Apps") {
        if (!formData.myEbmsApp) e.myEbmsApp = "Please select an app.";
        if (formData.myEbmsApp === "Main app/multiple/other" && !formData.myEbmsAppOther.trim()) e.myEbmsAppOther = "Please specify.";
        validateBugtrak(e);
      }

      if (formData.myEbmsSubType === "MyEBMS API Call") {
        if (!formData.apiAction) e.apiAction = "Action is required.";
        if (!formData.apiUrl.trim()) e.apiUrl = "URL is required.";
        if (!formData.apiRequestBody.trim()) e.apiRequestBody = "Request body is required.";
        if (!formData.apiStatusCode) e.apiStatusCode = "Status code is required.";
        if (formData.apiStatusCode === "Other" && !formData.apiStatusCodeOther.trim()) e.apiStatusCodeOther = "Please specify.";
        if (!formData.apiResponseBody.trim()) e.apiResponseBody = "Response body is required.";
      }

      if (formData.myEbmsSubType === "MyEBMS Server Instance") {
        if (!formData.serverDescription.trim()) e.serverDescription = "Description is required.";
      }
    }

    if (formData.productCategory === "Field Service Pro") {
      validateBugtrak(e);
    }

    return e;
  }

  function clearForm() {
    setFormData({
      salesforceLink: "",
      submitterEmail: localStorage.getItem("submitterEmail") || "",
      productCategory: "",
      priority: "",
      customer: "",
      version: "",
      briefSummary: "",
      myEbmsSubType: "",
      myEbmsApp: "",
      myEbmsAppOther: "",
      apiDescription: "",
      apiAction: "",
      apiUrl: "",
      apiRequestBody: "",
      apiStatusCode: "",
      apiStatusCodeOther: "",
      apiResponseBody: "",
      serverDescription: "",
      serverVideoLink: "",
      serverImageLink: "",
      syncErrors: "",
      btSerialNumbers: "",
      btReproducible: false,
      btSteps: "",
      btObservedBehavior: "",
      btExpectedBehavior: "",
      btMediaLink: "",
      btDataSetLink: "",
      btDescription: "",
      machineType: "",
      operatingSystem: "",
      problemDescr: "",
      reproducible: "",
      steps: "",
      observedBehavior: "",
      expectedBehavior: "",
      dataLink: "",
      anyData: false,
      videoLink: "",
      dumpFilesLink: "",
    });
    screenshots.forEach((item) => { if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl); });
    setScreenshots([]);
    setOpenSections((prev) => ({ ...prev, context: true }));
    setErrors({});
    setIsSubmitted(false);
    setIsSubmitting(false);
  }

  function buildBugtrakDesc() {
    let d = "";
    if (formData.btSerialNumbers) d += block("Serial Number(s)", formData.btSerialNumbers);
    if (formData.btReproducible) {
      d += `<p style="margin:4px 0;"><strong>Reproducible via steps:</strong> Yes</p>`;
      d += block("Steps to Reproduce", formData.btSteps);
      d += block("Observed Behavior", formData.btObservedBehavior);
      d += block("Expected Behavior", formData.btExpectedBehavior);
      d += link(formData.btMediaLink, "Video/Image Link");
      d += link(formData.btDataSetLink, "EBMS Data Set Link");
    } else {
      d += block("Description of Problem", formData.btDescription);
      d += link(formData.btMediaLink, "Video/Image Link");
      d += link(formData.btDataSetLink, "EBMS Data Set Link");
    }
    return d;
  }

  function buildFizzyCardPayload() {
    const boardId = config.boardMap[formData.productCategory] || "";
    const isBrad = BRAD_PRODUCTS.includes(formData.productCategory);

    const title = isBrad
      ? `${formData.productCategory}: ${formData.briefSummary.trim()}`
      : formData.priority
        ? `[${formData.priority}] ${formData.problemDescr.trim()}`
        : formData.problemDescr.trim();

    let desc = `<div>`;
    desc += row("Product", formData.productCategory);
    desc += row("Customer", formData.customer);
    desc += row("Priority", formData.priority);
    if (formData.productCategory === "EBMS") desc += row("Version", formData.version);
    if (isBrad) desc += row("Brief Summary", formData.briefSummary);

    if (!isBrad) {
      desc += `<div style="margin-top:12px;">`;
      desc += block("Description of Problem", formData.problemDescr);
      desc += row("Reproducible", formData.reproducible);
      if (formData.steps) desc += block("Steps to Reproduce", formData.steps);
      desc += block("Observed Behavior", formData.observedBehavior);
      desc += block("Expected Behavior", formData.expectedBehavior);
      if (formData.machineType) desc += row("Machine Type", formData.machineType);
      if (formData.operatingSystem) desc += row("Operating System", formData.operatingSystem);
      desc += `</div>`;
      const hasLinks = formData.salesforceLink || formData.dataLink || formData.anyData || formData.videoLink || formData.dumpFilesLink;
      if (hasLinks) {
        desc += `<div style="margin-top:12px;">`;
        desc += link(formData.salesforceLink, "Salesforce Ticket");
        desc += link(formData.dataLink, "Data Link");
        if (formData.anyData) desc += `<p style="margin:4px 0;"><strong>Any Data:</strong> Reproducible on any dataset</p>`;
        desc += link(formData.videoLink, "Video Link");
        desc += link(formData.dumpFilesLink, "Dump Files Link");
        desc += `</div>`;
      }
    } else if (formData.productCategory === "MyEBMS") {
      desc += row("Type", formData.myEbmsSubType);
      desc += `<div style="margin-top:12px;">`;
      if (formData.myEbmsSubType === "MyEBMS Apps") {
        const appLabel = formData.myEbmsApp === "Main app/multiple/other" && formData.myEbmsAppOther
          ? `Main app/multiple/other — ${formData.myEbmsAppOther}`
          : formData.myEbmsApp;
        desc += row("App", appLabel);
        desc += buildBugtrakDesc();
      } else if (formData.myEbmsSubType === "MyEBMS API Call") {
        if (formData.apiDescription) desc += block("Description", formData.apiDescription);
        desc += row("Action", formData.apiAction);
        desc += row("URL", formData.apiUrl);
        desc += codeBlock("Request Body", formData.apiRequestBody);
        const statusLabel = formData.apiStatusCode === "Other"
          ? `Other — ${formData.apiStatusCodeOther}`
          : formData.apiStatusCode;
        desc += row("Status Code", statusLabel);
        desc += codeBlock("Response Body", formData.apiResponseBody);
      } else if (formData.myEbmsSubType === "MyEBMS Server Instance") {
        desc += block("Description", formData.serverDescription);
        desc += link(formData.serverVideoLink, "Video Link");
        desc += link(formData.serverImageLink, "Image Link");
      }
      desc += `</div>`;
      if (formData.salesforceLink) desc += `<div style="margin-top:12px;">${link(formData.salesforceLink, "Salesforce Ticket")}</div>`;
    } else if (formData.productCategory === "Field Service Pro") {
      desc += `<div style="margin-top:12px;">`;
      desc += buildBugtrakDesc();
      if (formData.syncErrors) desc += block("Sync Errors", formData.syncErrors);
      desc += `</div>`;
      if (formData.salesforceLink) desc += `<div style="margin-top:12px;">${link(formData.salesforceLink, "Salesforce Ticket")}</div>`;
    }

    desc += `
      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e0ebe5;">
        <p style="margin:0;color:#4a7a62;font-style:italic;font-size:0.9em;">Submitted via Fizzibility${formData.submitterEmail ? ` by ${escapeHtml(formData.submitterEmail)}` : ""}</p>
      </div>
    </div>`;

    return {
      boardId,
      title,
      body: desc.trim(),
      submitterEmail: formData.submitterEmail.trim(),
      isEmergency: formData.priority === "Emergency",
    };
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(clearAfter = false) {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const contextFields = ["productCategory", "customer", "version", "briefSummary", "myEbmsSubType", "myEbmsApp", "myEbmsAppOther"];
      const reproFields = ["problemDescr", "reproducible", "observedBehavior", "expectedBehavior"];
      const detailFields = ["apiAction","apiUrl","apiRequestBody","apiStatusCode","apiStatusCodeOther","apiResponseBody","serverDescription","btSteps","btObservedBehavior","btExpectedBehavior","btDescription","btMediaLink"];
      setOpenSections((prev) => ({
        ...prev,
        context: prev.context || contextFields.some((f) => validationErrors[f]),
        reproduction: prev.reproduction || reproFields.some((f) => validationErrors[f]),
        details: prev.details || detailFields.some((f) => validationErrors[f]),
      }));
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const payload = buildFizzyCardPayload();

    if (screenshots.length > 0) {
      payload.screenshots = await Promise.all(
        screenshots.map(async (item) => ({
          name: item.file.name || `screenshot-${Date.now()}.png`,
          type: item.file.type || "image/png",
          size: item.file.size,
          data: await fileToBase64(item.file),
        }))
      );
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/createbugtrack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("Azure Function response:", result);
      if (!response.ok) { alert("Submit failed. Check the console for details."); return; }
      const ss = result.screenshots;
      if (ss && ss.failed > 0) {
        alert(`Card created, but ${ss.failed} screenshot(s) failed to upload:\n${ss.errors.join("\n")}\n\nCheck the console for details.`);
      } else if (ss && ss.uploaded > 0) {
        alert(`Bug track submitted successfully with ${ss.uploaded} screenshot(s).`);
      } else {
        alert("Bug track submitted successfully.");
      }
      if (result.fizzy?.url) window.open(result.fizzy.url, "_blank", "noopener,noreferrer");
      setKonamiActive(true);
      setTimeout(() => setKonamiActive(false), 4000);
      if (clearAfter) { clearForm(); } else { setIsSubmitted(true); }
    } catch (error) {
      console.error("Submit failed - full error:", error);
      alert("Could not reach the Azure Function.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEmergency = formData.priority === "Emergency";
  const showDetails = formData.productCategory === "Field Service Pro" ||
    (formData.productCategory === "MyEBMS" && !!formData.myEbmsSubType);
  const screenshotNum = isBradsProduct ? 3 : 5;
  const previewNum = isBradsProduct ? 4 : 6;
  const faqNum = isBradsProduct ? 5 : 7;

  return (
    <div className={`page${isEmergency ? " page--emergency" : ""}`}>
      {konamiActive && (
        <div className="confetti-container" aria-hidden="true">
          {confettiPieces.map((p, i) => (
            <div key={i} className="confetti-piece" style={{ left: p.left, background: p.color, animationDelay: p.delay, animationDuration: p.duration, width: p.size, height: p.size }} />
          ))}
        </div>
      )}
      <div className="container">
        <div style={{ position: "relative" }}>
          <h1 className="page-title" onClick={handleTitleClick}>Welcome to Fizzibility</h1>
          {bubblesActive && (
            <div className="bubbles-container" aria-hidden="true">
              {bubblePieces.map((b, i) => (
                <span key={i} className="bubble" style={{ left: b.left, animationDelay: b.delay, fontSize: b.size }}>🫧</span>
              ))}
            </div>
          )}
        </div>
        <p className="page-subtitle">This form is used as a template to submit bug tracks</p>
        <p className="duplicate-check">
          Before submitting, <a href="https://app.powerbi.com/groups/cda17dd6-822b-496b-a377-83d5508914cb/reports/58bc92bd-2887-41d5-9a55-4161dc60d554/63e389163776d221ca30?language=en-US&disableBranding=1&experience=power-bi" target="_blank" rel="noopener noreferrer">search existing bug tracks</a> to avoid duplicates.
        </p>
        {isFridayAfternoon && <p className="easter-nudge">☕ Submitting bugs on a Friday? Bold move.</p>}

        <div className="card sf-card">
          <label className="form-label">Your Email *</label>
          <input
            className={`form-input${errors.submitterEmail ? " input-error" : ""}`}
            type="email"
            name="submitterEmail"
            value={formData.submitterEmail}
            onChange={handleChange}
            placeholder="you@koblesystems.com"
          />
          {errors.submitterEmail && <p className="field-error">{errors.submitterEmail}</p>}

          <label className="form-label">Salesforce Ticket Link</label>
          <input
            className="form-input"
            type="text"
            name="salesforceLink"
            value={formData.salesforceLink}
            onChange={handleChange}
            placeholder="Paste Salesforce ticket URL (optional)"
          />
        </div>

        {/* ── 1. CONTEXT ── */}
        <Section sectionKey="context" title="1. Context" isOpen={openSections.context} onToggle={toggleSection} status={getSectionStatus("context")}>
          <label className="form-label">Product *</label>
          <select
            className={`form-input${errors.productCategory ? " input-error" : ""}`}
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
          >
            <option value="" disabled>Select a product</option>
            {config.productCategories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {errors.productCategory && <p className="field-error">{errors.productCategory}</p>}

          <label className="form-label">Priority *</label>
          <select
            className={`form-input${errors.priority ? " input-error" : ""}${formData.priority === "Emergency" ? " input-emergency" : ""}`}
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="" disabled>Select priority</option>
            <option value="Emergency">🚨 Emergency (I NEED HELP NOW)</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
          {errors.priority && <p className="field-error">{errors.priority}</p>}
          {formData.priority === "Emergency" && (
            <div className="emergency-note">
              <strong>⚠️ Stop — don't just submit and wait.</strong> Please reach out directly to an engineer or the product team <em>right now</em>. This form helps us track the issue, but it is not a substitute for immediate contact.
            </div>
          )}

          <label className="form-label">Customer *</label>
          <input
            className={`form-input${errors.customer ? " input-error" : ""}`}
            type="text"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            placeholder="Customer name or account"
          />
          {errors.customer && <p className="field-error">{errors.customer}</p>}
          {formData.customer.trim().toLowerCase() === "test" && (
            <p className="easter-nudge">👀 Is this a real bug or just testing?</p>
          )}

          {formData.productCategory === "EBMS" && (
            <>
              <label className="form-label">Version *</label>
              <input
                className={`form-input${errors.version ? " input-error" : ""}`}
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="Example: 8.6.239.049"
              />
              {errors.version && <p className="field-error">{errors.version}</p>}
            </>
          )}

          {formData.productCategory === "MyEBMS" && (
            <>
              <label className="form-label">Type *</label>
              <select
                className={`form-input${errors.myEbmsSubType ? " input-error" : ""}`}
                name="myEbmsSubType"
                value={formData.myEbmsSubType}
                onChange={handleChange}
              >
                <option value="" disabled>Select a type</option>
                <option value="MyEBMS Apps">MyEBMS Apps</option>
                <option value="MyEBMS API Call">MyEBMS API Call</option>
                <option value="MyEBMS Server Instance">MyEBMS Server Instance</option>
              </select>
              {errors.myEbmsSubType && <p className="field-error">{errors.myEbmsSubType}</p>}
            </>
          )}

          {formData.productCategory === "MyEBMS" && formData.myEbmsSubType === "MyEBMS Apps" && (
            <>
              <label className="form-label">App *</label>
              <select
                className={`form-input${errors.myEbmsApp ? " input-error" : ""}`}
                name="myEbmsApp"
                value={formData.myEbmsApp}
                onChange={handleChange}
              >
                <option value="" disabled>Select an app</option>
                {MYEBMS_APPS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.myEbmsApp && <p className="field-error">{errors.myEbmsApp}</p>}
              {formData.myEbmsApp === "Main app/multiple/other" && (
                <>
                  <label className="form-label">Specify *</label>
                  <input
                    className={`form-input${errors.myEbmsAppOther ? " input-error" : ""}`}
                    type="text"
                    name="myEbmsAppOther"
                    value={formData.myEbmsAppOther}
                    onChange={handleChange}
                    placeholder="Which app(s)?"
                  />
                  {errors.myEbmsAppOther && <p className="field-error">{errors.myEbmsAppOther}</p>}
                </>
              )}
            </>
          )}

          {isBradsProduct && (
            <>
              <label className="form-label">
                Brief Problem Summary * <span className="char-hint">({formData.briefSummary.length}/50)</span>
              </label>
              <input
                className={`form-input${errors.briefSummary ? " input-error" : ""}`}
                type="text"
                name="briefSummary"
                value={formData.briefSummary}
                onChange={handleChange}
                maxLength={50}
                placeholder="Short summary of the issue"
              />
              {errors.briefSummary && <p className="field-error">{errors.briefSummary}</p>}
            </>
          )}
        </Section>

        {/* ── 2. ENVIRONMENT (EBMS / WEB only) ── */}
        {!isBradsProduct && (
          <Section sectionKey="environment" title="2. Environment" isOpen={openSections.environment} onToggle={toggleSection} status={getSectionStatus("environment")}>
            <label className="form-label">Workstation / Server</label>
            <select className="form-input" name="machineType" value={formData.machineType} onChange={handleChange}>
              <option value="" disabled>Select one</option>
              {config.workstationTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <label className="form-label">Operating System</label>
            <input
              className="form-input"
              type="text"
              name="operatingSystem"
              value={formData.operatingSystem}
              onChange={handleChange}
              placeholder="Example: Windows 11 Pro 24H2"
            />
            <div className="help-text">For OS info go to Settings, System, About.</div>
          </Section>
        )}

        {/* ── 3. REPRODUCTION (EBMS / WEB only) ── */}
        {!isBradsProduct && (
          <Section sectionKey="reproduction" title="3. Reproduction" isOpen={openSections.reproduction} onToggle={toggleSection} status={getSectionStatus("reproduction")}>
            <label className="form-label">Description of Problem *</label>
            <textarea
              className={`form-textarea${errors.problemDescr ? " input-error" : ""}`}
              name="problemDescr"
              value={formData.problemDescr}
              onChange={handleChange}
              placeholder="EBMS won't open"
            />
            {errors.problemDescr && <p className="field-error">{errors.problemDescr}</p>}
            {formData.problemDescr.length >= 500 && <p className="easter-nudge">📝 Wow, that's a lot of bug.</p>}

            <label className="form-label">Reproducible *</label>
            <select
              className={`form-input${errors.reproducible ? " input-error" : ""}`}
              name="reproducible"
              value={formData.reproducible}
              onChange={handleChange}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Kinda">Kinda</option>
            </select>
            {errors.reproducible && <p className="field-error">{errors.reproducible}</p>}
            {formData.reproducible === "Kinda" && <p className="easter-nudge">😅 We've all been there.</p>}
            {formData.reproducible === "No" && <p className="easter-nudge">🙏 No worries — go ahead and submit it. Just know we have the best luck fixing bugs we can reproduce.</p>}

            <label className="form-label">Steps to Reproduce</label>
            <textarea
              className="form-textarea"
              name="steps"
              value={formData.steps}
              onChange={handleChange}
              placeholder="List each step clearly. Example: 1. Open Sales Order 2. Assign customer 3. Press Ctrl+N"
            />

            <label className="form-label">Observed Behavior *</label>
            <textarea
              className={`form-textarea${errors.observedBehavior ? " input-error" : ""}`}
              name="observedBehavior"
              value={formData.observedBehavior}
              onChange={handleChange}
              placeholder="What happened?"
            />
            {errors.observedBehavior && <p className="field-error">{errors.observedBehavior}</p>}

            <label className="form-label">Expected Behavior *</label>
            <textarea
              className={`form-textarea${errors.expectedBehavior ? " input-error" : ""}`}
              name="expectedBehavior"
              value={formData.expectedBehavior}
              onChange={handleChange}
              placeholder="What should have happened instead?"
            />
            {errors.expectedBehavior && <p className="field-error">{errors.expectedBehavior}</p>}
          </Section>
        )}

        {/* ── 4. ATTACHMENTS (EBMS / WEB only) ── */}
        {!isBradsProduct && (
          <Section sectionKey="attachments" title="4. Attachments / Links" isOpen={openSections.attachments} onToggle={toggleSection} status={getSectionStatus("attachments")}>
            <label className="form-label">Data Link</label>
            <input className="form-input" type="text" name="dataLink" value={formData.dataLink} onChange={handleChange} placeholder="Paste archival/data link" />
            <div className="help-text">
              <a href={config.helpLinks.archivalTool} target="_blank" rel="noopener noreferrer">How to use archival tool</a>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" name="anyData" checked={formData.anyData} onChange={handleChange} />
              Any Data — reproducible on any dataset
            </label>

            <label className="form-label">Video Link</label>
            <input className="form-input" type="text" name="videoLink" value={formData.videoLink} onChange={handleChange} placeholder="Paste video link" />

            <label className="form-label">Dump Files Link</label>
            <input className="form-input" type="text" name="dumpFilesLink" value={formData.dumpFilesLink} onChange={handleChange} placeholder="Paste dump files link" />
            <div className="help-text">
              <a href={config.helpLinks.dumpFiles} target="_blank" rel="noopener noreferrer">How to create dump files</a>
            </div>
          </Section>
        )}

        {/* ── 2. DETAILS (Brad's products) ── */}
        {showDetails && (
          <Section sectionKey="details" title="2. Details" isOpen={openSections.details} onToggle={toggleSection} status={getSectionStatus("details")}>

            {/* MyEBMS API Call */}
            {formData.myEbmsSubType === "MyEBMS API Call" && (
              <>
                <label className="form-label">Description of Problem</label>
                <textarea className="form-textarea" name="apiDescription" value={formData.apiDescription} onChange={handleChange} placeholder="Optional — describe the issue" />

                <label className="form-label">Action *</label>
                <select className={`form-input${errors.apiAction ? " input-error" : ""}`} name="apiAction" value={formData.apiAction} onChange={handleChange}>
                  <option value="" disabled>Select action</option>
                  {API_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                {errors.apiAction && <p className="field-error">{errors.apiAction}</p>}

                <label className="form-label">URL *</label>
                <input className={`form-input${errors.apiUrl ? " input-error" : ""}`} type="text" name="apiUrl" value={formData.apiUrl} onChange={handleChange} placeholder="e.g. /api/v1/orders" />
                {errors.apiUrl && <p className="field-error">{errors.apiUrl}</p>}

                <label className="form-label">Request Body *</label>
                <textarea className={`form-textarea form-textarea--code${errors.apiRequestBody ? " input-error" : ""}`} name="apiRequestBody" value={formData.apiRequestBody} onChange={handleChange} placeholder='{"key": "value"}' />
                {errors.apiRequestBody && <p className="field-error">{errors.apiRequestBody}</p>}

                <label className="form-label">Status Code *</label>
                <select className={`form-input${errors.apiStatusCode ? " input-error" : ""}`} name="apiStatusCode" value={formData.apiStatusCode} onChange={handleChange}>
                  <option value="" disabled>Select status code</option>
                  {API_STATUS_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.apiStatusCode && <p className="field-error">{errors.apiStatusCode}</p>}
                {formData.apiStatusCode === "Other" && (
                  <>
                    <label className="form-label">Specify *</label>
                    <input className={`form-input${errors.apiStatusCodeOther ? " input-error" : ""}`} type="text" name="apiStatusCodeOther" value={formData.apiStatusCodeOther} onChange={handleChange} placeholder="Enter status code" />
                    {errors.apiStatusCodeOther && <p className="field-error">{errors.apiStatusCodeOther}</p>}
                  </>
                )}

                <label className="form-label">Response Body *</label>
                <textarea className={`form-textarea form-textarea--code${errors.apiResponseBody ? " input-error" : ""}`} name="apiResponseBody" value={formData.apiResponseBody} onChange={handleChange} placeholder='{"error": "message"}' />
                {errors.apiResponseBody && <p className="field-error">{errors.apiResponseBody}</p>}
              </>
            )}

            {/* MyEBMS Server Instance */}
            {formData.myEbmsSubType === "MyEBMS Server Instance" && (
              <>
                <label className="form-label">Description of Problem *</label>
                <textarea className={`form-textarea${errors.serverDescription ? " input-error" : ""}`} name="serverDescription" value={formData.serverDescription} onChange={handleChange} placeholder="Describe the issue" />
                {errors.serverDescription && <p className="field-error">{errors.serverDescription}</p>}

                <label className="form-label">Video Link(s)</label>
                <input className="form-input" type="text" name="serverVideoLink" value={formData.serverVideoLink} onChange={handleChange} placeholder="Paste video link" />

                <label className="form-label">Image Link(s)</label>
                <input className="form-input" type="text" name="serverImageLink" value={formData.serverImageLink} onChange={handleChange} placeholder="Paste image link" />
              </>
            )}

            {/* Bugtrack fields — MyEBMS Apps or Field Service Pro */}
            {(formData.myEbmsSubType === "MyEBMS Apps" || formData.productCategory === "Field Service Pro") && (
              <>
                <label className="form-label">Serial Number(s)</label>
                <textarea className="form-textarea" name="btSerialNumbers" value={formData.btSerialNumbers} onChange={handleChange} placeholder="One per line" />

                <label className="checkbox-label" style={{ marginBottom: "10px" }}>
                  <input type="checkbox" name="btReproducible" checked={formData.btReproducible} onChange={handleChange} />
                  Reproducible through specific steps
                </label>

                {formData.btReproducible ? (
                  <>
                    <label className="form-label">Steps *</label>
                    <textarea className={`form-textarea${errors.btSteps ? " input-error" : ""}`} name="btSteps" value={formData.btSteps} onChange={handleChange} placeholder="List each step clearly" />
                    {errors.btSteps && <p className="field-error">{errors.btSteps}</p>}

                    <label className="form-label">Observed Behavior *</label>
                    <textarea className={`form-textarea${errors.btObservedBehavior ? " input-error" : ""}`} name="btObservedBehavior" value={formData.btObservedBehavior} onChange={handleChange} placeholder="What happened?" />
                    {errors.btObservedBehavior && <p className="field-error">{errors.btObservedBehavior}</p>}

                    <label className="form-label">Expected Behavior *</label>
                    <textarea className={`form-textarea${errors.btExpectedBehavior ? " input-error" : ""}`} name="btExpectedBehavior" value={formData.btExpectedBehavior} onChange={handleChange} placeholder="What should have happened?" />
                    {errors.btExpectedBehavior && <p className="field-error">{errors.btExpectedBehavior}</p>}

                    <label className="form-label">Video / Image Link(s)</label>
                    <input className="form-input" type="text" name="btMediaLink" value={formData.btMediaLink} onChange={handleChange} placeholder="Paste link" />

                    <label className="form-label">EBMS Data Set Link(s)</label>
                    <input className="form-input" type="text" name="btDataSetLink" value={formData.btDataSetLink} onChange={handleChange} placeholder="Paste archival/data link" />
                  </>
                ) : (
                  <>
                    <label className="form-label">Description of Problem *</label>
                    <textarea className={`form-textarea${errors.btDescription ? " input-error" : ""}`} name="btDescription" value={formData.btDescription} onChange={handleChange} placeholder="Describe the issue" />
                    {errors.btDescription && <p className="field-error">{errors.btDescription}</p>}

                    <label className="form-label">Video or Image Link *</label>
                    <input className={`form-input${errors.btMediaLink ? " input-error" : ""}`} type="text" name="btMediaLink" value={formData.btMediaLink} onChange={handleChange} placeholder="Paste link" />
                    {errors.btMediaLink && <p className="field-error">{errors.btMediaLink}</p>}

                    <label className="form-label">EBMS Data Set Link(s)</label>
                    <input className="form-input" type="text" name="btDataSetLink" value={formData.btDataSetLink} onChange={handleChange} placeholder="Paste archival/data link" />
                  </>
                )}

                {formData.productCategory === "Field Service Pro" && (
                  <>
                    <label className="form-label">Sync Errors</label>
                    <textarea className="form-textarea" name="syncErrors" value={formData.syncErrors} onChange={handleChange} placeholder="Paste sync errors copied from the app" />
                  </>
                )}
              </>
            )}
          </Section>
        )}

        {/* ── SCREENSHOTS ── */}
        <Section sectionKey="screenshots" title={`${screenshotNum}. Screenshots`} isOpen={openSections.screenshots} onToggle={toggleSection} status={getSectionStatus("screenshots")}>
          <div
            className={`paste-zone${isDragOver ? " paste-zone--drag-over" : ""}`}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            tabIndex={0}
          >
            {isDragOver ? "Drop images here" : "Click here and Ctrl+V to paste, or drag and drop images."}
          </div>
          <label className="upload-button">
            Upload screenshot files
            <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: "none" }} />
          </label>
          {screenshots.length > 0 && (
            <div className="image-grid">
              {screenshots.map((item, index) => (
                <div key={index} className="image-card">
                  <img src={item.previewUrl} alt={`Screenshot ${index + 1}`} className="image-preview" />
                  <div className="file-name">{item.file.name || `Pasted image ${index + 1}`}</div>
                  <button type="button" onClick={() => removeScreenshot(index)} className="remove-button">Remove</button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── PREVIEW ── */}
        <Section sectionKey="preview" title={`${previewNum}. Preview`} isOpen={openSections.preview} onToggle={toggleSection}>
          <CardPreview formData={formData} screenshots={screenshots} isBradsProduct={isBradsProduct} />
        </Section>

        {/* ── FAQ ── */}
        <Section sectionKey="faq" title={`${faqNum}. Quick Troubleshooting Checklist`} isOpen={openSections.faq} onToggle={toggleSection}>
          <div className="tip-box">
            <p className="tip-intro">Standard things to check before submitting:</p>
            <ul className="tip-list">
              <li>Security: antivirus, firewall, web/content filters</li>
              <li>System health: free drive space, RAM, CPU usage, power plan</li>
              <li>Software conflicts: backup software, file-locking tools, recent updates</li>
              <li>Access: user permissions, admin rights</li>
              <li>Environment: network issues, proxy/filtering, customer-specific factors</li>
            </ul>
          </div>
        </Section>

        <div className="submit-row">
          <button type="button" className="submit-button" onClick={() => handleSubmit()} disabled={isSubmitting || isSubmitted}>
            {isSubmitting ? "Submitting…" : isSubmitted ? "Submitted ✓" : "Submit Bug Track"}
          </button>
          <button type="button" className="submit-button submit-button--secondary" onClick={clearForm} disabled={isSubmitting}>
            Clear Form
          </button>
        </div>
        <div className="submit-footer">
          <a href="https://app.fizzy.do" target="_blank" rel="noopener noreferrer">Open Fizzy</a>
        </div>

        <div className="sla-note">
          <p className="sla-title">Service Level Agreement (SLA)</p>
          <p>Bug submissions are reviewed within 24 business hours and prioritized based on impact (High / Normal / Low).</p>
          <p>Non-emergency bug fixes are expected to be delivered within 30 days.</p>
          <p>Some submissions may be classified as change requests, which are evaluated and scheduled alongside ongoing work and may not have a defined delivery timeline.</p>
          <p>Urgent issues are handled as soon as an engineer is available.</p>
        </div>
      </div>
    </div>
  );
}

function CardPreview({ formData, screenshots, isBradsProduct }) {
  const hasAnyData = Object.entries(formData).some(([k, v]) => k !== "btReproducible" && k !== "anyData" && (v?.trim?.() || (typeof v === "boolean" && v)));

  if (!hasAnyData) {
    return <p className="preview-empty">Fill out the form above to see a preview of your Fizzy card.</p>;
  }

  const hasLinks = !isBradsProduct && (formData.salesforceLink || formData.dataLink || formData.anyData || formData.videoLink || formData.dumpFilesLink);

  return (
    <div className="card-preview">
      <div className="card-preview-title">
        {isBradsProduct
          ? formData.briefSummary
            ? <>{formData.productCategory && <span className="preview-priority">{formData.productCategory}:</span>} {formData.briefSummary}</>
            : <span className="preview-placeholder">No summary yet</span>
          : formData.problemDescr
            ? <>{formData.priority && <span className="preview-priority">[{formData.priority}]</span>} {formData.problemDescr}</>
            : <span className="preview-placeholder">No title yet</span>
        }
      </div>

      <div className="card-preview-section">
        <PreviewRow label="Submitted By" value={formData.submitterEmail} />
        <PreviewRow label="Product" value={formData.productCategory} />
        <PreviewRow label="Customer" value={formData.customer} />
        <PreviewRow label="Priority" value={formData.priority} />
        {formData.productCategory === "EBMS" && <PreviewRow label="Version" value={formData.version} />}
        {isBradsProduct && formData.myEbmsSubType && <PreviewRow label="Type" value={formData.myEbmsSubType} />}
        {formData.myEbmsSubType === "MyEBMS Apps" && <PreviewRow label="App" value={formData.myEbmsApp === "Main app/multiple/other" ? `Other — ${formData.myEbmsAppOther}` : formData.myEbmsApp} />}
      </div>

      {/* EBMS/WEB preview */}
      {!isBradsProduct && (formData.problemDescr || formData.reproducible) && (
        <div className="card-preview-section">
          <PreviewBlock label="Description" value={formData.problemDescr} />
          <PreviewRow label="Reproducible" value={formData.reproducible} />
        </div>
      )}
      {!isBradsProduct && formData.steps && (
        <div className="card-preview-section">
          <PreviewBlock label="Steps to Reproduce" value={formData.steps} />
        </div>
      )}
      {!isBradsProduct && (formData.observedBehavior || formData.expectedBehavior) && (
        <div className="card-preview-section">
          <PreviewBlock label="Observed Behavior" value={formData.observedBehavior} />
          <PreviewBlock label="Expected Behavior" value={formData.expectedBehavior} />
        </div>
      )}
      {!isBradsProduct && (formData.machineType || formData.operatingSystem) && (
        <div className="card-preview-section">
          <PreviewRow label="Machine Type" value={formData.machineType} />
          <PreviewRow label="Operating System" value={formData.operatingSystem} />
        </div>
      )}

      {/* MyEBMS API Call preview */}
      {formData.myEbmsSubType === "MyEBMS API Call" && (
        <div className="card-preview-section">
          {formData.apiDescription && <PreviewBlock label="Description" value={formData.apiDescription} />}
          <PreviewRow label="Action" value={formData.apiAction} />
          <PreviewRow label="URL" value={formData.apiUrl} />
          {formData.apiRequestBody && <PreviewCodeBlock label="Request Body" value={formData.apiRequestBody} />}
          <PreviewRow label="Status Code" value={formData.apiStatusCode === "Other" ? `Other — ${formData.apiStatusCodeOther}` : formData.apiStatusCode} />
          {formData.apiResponseBody && <PreviewCodeBlock label="Response Body" value={formData.apiResponseBody} />}
        </div>
      )}

      {/* MyEBMS Server Instance preview */}
      {formData.myEbmsSubType === "MyEBMS Server Instance" && (
        <div className="card-preview-section">
          <PreviewBlock label="Description" value={formData.serverDescription} />
          <PreviewRow label="Video Link" value={formData.serverVideoLink} />
          <PreviewRow label="Image Link" value={formData.serverImageLink} />
        </div>
      )}

      {/* Bugtrack fields preview */}
      {(formData.myEbmsSubType === "MyEBMS Apps" || formData.productCategory === "Field Service Pro") && (
        <div className="card-preview-section">
          {formData.btSerialNumbers && <PreviewBlock label="Serial Number(s)" value={formData.btSerialNumbers} />}
          <PreviewRow label="Reproducible via steps" value={formData.btReproducible ? "Yes" : "No"} />
          {formData.btReproducible ? (
            <>
              <PreviewBlock label="Steps" value={formData.btSteps} />
              <PreviewBlock label="Observed Behavior" value={formData.btObservedBehavior} />
              <PreviewBlock label="Expected Behavior" value={formData.btExpectedBehavior} />
            </>
          ) : (
            <PreviewBlock label="Description" value={formData.btDescription} />
          )}
          <PreviewRow label="Video/Image Link" value={formData.btMediaLink} />
          <PreviewRow label="EBMS Data Set Link" value={formData.btDataSetLink} />
          {formData.productCategory === "Field Service Pro" && <PreviewBlock label="Sync Errors" value={formData.syncErrors} />}
        </div>
      )}

      {hasLinks && (
        <div className="card-preview-section">
          {formData.salesforceLink && <p className="preview-link-row"><strong>Salesforce Ticket:</strong> <a href={formData.salesforceLink} target="_blank" rel="noopener noreferrer">{formData.salesforceLink}</a></p>}
          {formData.dataLink && <p className="preview-link-row"><strong>Data:</strong> <a href={formData.dataLink} target="_blank" rel="noopener noreferrer">{formData.dataLink}</a></p>}
          {formData.anyData && <p className="preview-link-row"><strong>Any Data:</strong> Reproducible on any dataset</p>}
          {formData.videoLink && <p className="preview-link-row"><strong>Video:</strong> <a href={formData.videoLink} target="_blank" rel="noopener noreferrer">{formData.videoLink}</a></p>}
          {formData.dumpFilesLink && <p className="preview-link-row"><strong>Dump Files:</strong> <a href={formData.dumpFilesLink} target="_blank" rel="noopener noreferrer">{formData.dumpFilesLink}</a></p>}
        </div>
      )}

      {screenshots.length > 0 && (
        <div className="card-preview-section">
          <p className="preview-screenshots-label"><strong>Screenshots:</strong> {screenshots.length} attached</p>
          <div className="preview-image-strip">
            {screenshots.map((item, index) => (
              <img key={index} src={item.previewUrl} alt={`Screenshot ${index + 1}`} className="preview-image-thumb" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewRow({ label, value }) {
  if (!value) return null;
  return <p className="preview-row"><strong>{label}:</strong> {value}</p>;
}

function PreviewBlock({ label, value }) {
  if (!value) return null;
  return (
    <div className="preview-block">
      <strong>{label}:</strong>
      <p className="preview-block-text">{value}</p>
    </div>
  );
}

function PreviewCodeBlock({ label, value }) {
  if (!value) return null;
  return (
    <div className="preview-block">
      <strong>{label}:</strong>
      <pre className="preview-code">{value}</pre>
    </div>
  );
}

function SectionBadge({ status }) {
  if (!status) return null;
  const { filled, total, optional } = status;
  if (total === null) {
    if (filled === 0) return null;
    return <span className="section-badge section-badge--done">{filled} added</span>;
  }
  if (filled === 0) return null;
  if (filled === total) return <span className="section-badge section-badge--done">✓ {total}/{total}</span>;
  if (optional) return <span className="section-badge section-badge--optional">{filled}/{total}</span>;
  return <span className="section-badge section-badge--partial">{filled}/{total}</span>;
}

function Section({ sectionKey, title, isOpen, onToggle, children, status }) {
  return (
    <div className="card">
      <button type="button" onClick={() => onToggle(sectionKey)} className="section-header">
        <span className="section-header-left">
          <span>{title}</span>
          <SectionBadge status={status} />
        </span>
        <span className="chevron">{isOpen ? "▾" : "▸"}</span>
      </button>
      {isOpen && <div className="section-body">{children}</div>}
    </div>
  );
}
