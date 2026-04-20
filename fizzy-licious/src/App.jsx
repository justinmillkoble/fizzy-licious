import { useState } from "react";
import "./App.css";

export default function BugTrackFormMockup() {
  const config = {
    productCategories: ["EBMS", "APP/API", "WEB"],
    workstationTypes: ["Workstation", "Server"],
    boardMap: {
      EBMS: "03f8h3jzo5a72vyv1nn1lqr3b",
      "APP/API": "03f8ogxdcurv55ieu67ufw54m",
      WEB: "03f5ft2t7sn9h4o4a8sgibvqx",
    },
    helpLinks: {
      osInfo: "#",
      archivalTool:
        "https://handsomely-numeric-b73.notion.site/Archiving-and-Exporting-Data-34581a3c209180948739ce422533e9cc?source=copy_link",
      dumpFiles: "http://boggle.eshcom.com:56565/?q=node/2961",
    },
  };

  const [openSections, setOpenSections] = useState({
    context: true,
    environment: false,
    reproduction: false,
    attachments: false,
    screenshots: false,
    faq: false,
    preview: false,
  });

  const [screenshots, setScreenshots] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const allowedDomains = ["koblesystems.com", "lumetrasolutions.ca", "ebmscanada.com"];

  const [formData, setFormData] = useState({
    salesforceLink: "",
    submitterEmail: localStorage.getItem("submitterEmail") || "",
    productCategory: "",
    priority: "",
    customer: "",
    version: "",
    machineType: "",
    operatingSystem: "",
    problemDescr: "",
    reproducible: "",
    steps: "",
    apiEndpoint: "",
    requestPayload: "",
    apiResponse: "",
    observedBehavior: "",
    expectedBehavior: "",
    dataLink: "",
    videoLink: "",
    dumpFilesLink: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  function getSectionStatus(sectionKey) {
    switch (sectionKey) {
      case "context": {
        const fields = ["productCategory", "priority", "customer"];
        if (formData.productCategory === "EBMS") fields.push("version");
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
        const filled = fields.filter((f) => formData[f]?.trim()).length;
        return { filled, total: fields.length, optional: true };
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

    const newItems = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setScreenshots((prev) => [...prev, ...newItems]);
  }

  const [isDragOver, setIsDragOver] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    const newItems = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setScreenshots((prev) => [...prev, ...newItems]);
  }

  function handlePaste(event) {
    const items = event.clipboardData?.items || [];
    const pastedImages = [];

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          pastedImages.push({
            file,
            previewUrl: URL.createObjectURL(file),
          });
        }
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
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
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

  function makeLink(url, label) {
    if (!url) return "";
    const safeUrl = escapeHtml(url);
    const safeLabel = escapeHtml(label);
    return `<p style="margin: 6px 0 0 0;"><a href="${safeUrl}">${safeLabel}</a></p>`;
  }

  function buildSection(title, content) {
    if (!content) return "";

    return `
      <div style="margin-top: 18px;">
        <p style="margin: 0 0 8px 0;"><strong style="font-size: 14px;">${escapeHtml(
      title
    )}</strong></p>
        <div style="margin-left: 2px;">
          ${content}
        </div>
      </div>
    `;
  }

  function buildFizzyCardPayload() {
  const boardId = config.boardMap[formData.productCategory] || "";
  const title = formData.priority
    ? `[${formData.priority}] ${formData.problemDescr.trim()}`
    : formData.problemDescr.trim();

  let description = `
    <div>
      <p><strong>Product:</strong> ${escapeHtml(formData.productCategory || "N/A")}</p>
      <p><strong>Customer:</strong> ${escapeHtml(formData.customer || "N/A")}</p>
      ${
        formData.productCategory === "EBMS"
          ? `<p><strong>Version:</strong> ${escapeHtml(formData.version || "N/A")}</p>`
          : ""
      }
    </div>

    <div style="margin-top:16px;">
      <p><strong>Description of Problem:</strong><br>${formatMultiline(
        formData.problemDescr || "N/A"
      )}</p>
      <p><strong>Reproducible:</strong> ${escapeHtml(formData.reproducible || "N/A")}</p>
      ${formData.steps ? `<p><strong>Steps to Reproduce:</strong><br>${formatMultiline(formData.steps)}</p>` : ""}
    </div>

    <div style="margin-top:16px;">
      <p><strong>Observed Behavior:</strong><br>${formatMultiline(
        formData.observedBehavior || "N/A"
      )}</p>
      <p><strong>Expected Behavior:</strong><br>${formatMultiline(
        formData.expectedBehavior || "N/A"
      )}</p>
    </div>
  `;

  if (formData.apiEndpoint || formData.requestPayload || formData.apiResponse) {
    description += `
      <div style="margin-top:16px;">
        ${formData.apiEndpoint ? `<p><strong>API Endpoint:</strong><br><code>${escapeHtml(formData.apiEndpoint)}</code></p>` : ""}
        ${formData.requestPayload ? `<p><strong>Request Payload:</strong><br><pre style="background:#f4f7f5;padding:10px;border-radius:6px;overflow-x:auto;">${escapeHtml(formData.requestPayload)}</pre></p>` : ""}
        ${formData.apiResponse ? `<p><strong>Response:</strong><br><pre style="background:#f4f7f5;padding:10px;border-radius:6px;overflow-x:auto;">${escapeHtml(formData.apiResponse)}</pre></p>` : ""}
      </div>
    `;
  }

  if (formData.machineType || formData.operatingSystem) {
    description += `
      <div style="margin-top:16px;">
        <p><strong>Machine Type:</strong> ${escapeHtml(formData.machineType || "N/A")}</p>
        <p><strong>Operating System:</strong> ${escapeHtml(formData.operatingSystem || "N/A")}</p>
      </div>
    `;
  }

  if (formData.salesforceLink || formData.dataLink || formData.videoLink || formData.dumpFilesLink) {
    description += `
      <div style="margin-top:16px;">
        ${
          formData.salesforceLink
            ? `<p><a href="${escapeHtml(formData.salesforceLink)}">Salesforce Ticket</a></p>`
            : ""
        }
        ${
          formData.dataLink
            ? `<p><a href="${escapeHtml(formData.dataLink)}">Data Link</a></p>`
            : ""
        }
        ${
          formData.videoLink
            ? `<p><a href="${escapeHtml(formData.videoLink)}">Video Link</a></p>`
            : ""
        }
        ${
          formData.dumpFilesLink
            ? `<p><a href="${escapeHtml(formData.dumpFilesLink)}">Dump Files Link</a></p>`
            : ""
        }
      </div>
    `;
  }

  description += `
    <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e0ebe5;">
      <p style="margin:0;color:#4a7a62;font-style:italic;font-size:0.9em;">Submitted via Koble Bug Track web form${formData.submitterEmail ? ` by ${escapeHtml(formData.submitterEmail)}` : ""}</p>
    </div>
  `;

  return {
    boardId,
    title,
    body: description.trim(),
    submitterEmail: formData.submitterEmail.trim(),
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
    if (formData.productCategory === "EBMS" && !formData.version.trim()) e.version = "Version is required for EBMS.";
    if (!formData.problemDescr.trim()) e.problemDescr = "Description of problem is required.";
    if (!formData.reproducible) e.reproducible = "Please select whether this is reproducible.";
    if (!formData.observedBehavior.trim()) e.observedBehavior = "Observed behavior is required.";
    if (!formData.expectedBehavior.trim()) e.expectedBehavior = "Expected behavior is required.";
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
      machineType: "",
      operatingSystem: "",
      problemDescr: "",
      reproducible: "",
      steps: "",
      apiEndpoint: "",
      requestPayload: "",
      apiResponse: "",
      observedBehavior: "",
      expectedBehavior: "",
      dataLink: "",
      videoLink: "",
      dumpFilesLink: "",
    });
    screenshots.forEach((item) => {
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setScreenshots([]);
    setOpenSections((prev) => ({ ...prev, context: true }));
    setErrors({});
    setIsSubmitted(false);
    setIsSubmitting(false);
  }

  async function handleSubmit(clearAfter = false) {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const contextFields = ["productCategory", "customer", "version"];
      const reproFields = ["problemDescr", "reproducible", "observedBehavior", "expectedBehavior"];
      setOpenSections((prev) => ({
        ...prev,
        context: prev.context || contextFields.some((f) => validationErrors[f]),
        reproduction: prev.reproduction || reproFields.some((f) => validationErrors[f]),
      }));
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    console.log("screenshots at submit:", screenshots.length);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log("Azure Function response:", result);

      if (!response.ok) {
        alert("Submit failed. Check the console for details.");
        return;
      }

      const ss = result.screenshots;
      if (ss && ss.failed > 0) {
        const errList = ss.errors.join("\n");
        alert(
          `Card created, but ${ss.failed} screenshot(s) failed to upload:\n${errList}\n\nCheck the console for details.`
        );
      } else if (ss && ss.uploaded > 0) {
        alert(`Bug track submitted successfully with ${ss.uploaded} screenshot(s).`);
      } else {
        alert("Bug track submitted successfully.");
      }

      if (result.fizzy?.url) {
        window.open(result.fizzy.url, "_blank", "noopener,noreferrer");
      }

      if (clearAfter) {
        clearForm();
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Submit failed - full error:", error);
      console.error("Error message:", error?.message);
      alert("Could not reach the Azure Function.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Koble Bug Track</h1>
        <p className="page-subtitle">
          This form is used as a template to submit bug tracks
        </p>

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

        <Section
          sectionKey="context"
          title="1. Context"
          isOpen={openSections.context}
          onToggle={toggleSection}
          status={getSectionStatus("context")}
        >
          <label className="form-label">Product Category *</label>
          <select
            className={`form-input${errors.productCategory ? " input-error" : ""}`}
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select a category
            </option>
            {config.productCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.productCategory && <p className="field-error">{errors.productCategory}</p>}

          <label className="form-label">Priority *</label>
          <select
            className={`form-input${errors.priority ? " input-error" : ""}`}
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="" disabled>Select priority</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
          {errors.priority && <p className="field-error">{errors.priority}</p>}

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
        </Section>

        <Section
          sectionKey="environment"
          title="2. Environment"
          isOpen={openSections.environment}
          onToggle={toggleSection}
          status={getSectionStatus("environment")}
        >
          <label className="form-label">Workstation / Server</label>
          <select
            className="form-input"
            name="machineType"
            value={formData.machineType}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select one
            </option>
            {config.workstationTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
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
          <div className="help-text">
            For OS info go to Settings, System, About.
          </div>
        </Section>

        <Section
          sectionKey="reproduction"
          title="3. Reproduction"
          status={getSectionStatus("reproduction")}
          isOpen={openSections.reproduction}
          onToggle={toggleSection}
        >
          <label className="form-label">Description of Problem *</label>
          <textarea
            className={`form-textarea${errors.problemDescr ? " input-error" : ""}`}
            name="problemDescr"
            value={formData.problemDescr}
            onChange={handleChange}
            placeholder="EBMS won't open"
          />
          {errors.problemDescr && <p className="field-error">{errors.problemDescr}</p>}

          <label className="form-label">Reproducible *</label>
          <select
            className={`form-input${errors.reproducible ? " input-error" : ""}`}
            name="reproducible"
            value={formData.reproducible}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Kinda">Kinda</option>
          </select>
          {errors.reproducible && <p className="field-error">{errors.reproducible}</p>}

          <label className="form-label">Steps to Reproduce</label>
          <textarea
            className="form-textarea"
            name="steps"
            value={formData.steps}
            onChange={handleChange}
            placeholder="List each step clearly. Example: 1. Open Sales Order 2. Assign customer 3. Press Ctrl+N"
          />

          {formData.productCategory === "APP/API" && (
            <>
              <label className="form-label">API Endpoint</label>
              <input
                className="form-input"
                type="text"
                name="apiEndpoint"
                value={formData.apiEndpoint}
                onChange={handleChange}
                placeholder="e.g. POST /api/v1/orders"
              />

              <label className="form-label">Request Payload</label>
              <textarea
                className="form-textarea form-textarea--code"
                name="requestPayload"
                value={formData.requestPayload}
                onChange={handleChange}
                placeholder='{"key": "value"}'
              />

              <label className="form-label">Response</label>
              <textarea
                className="form-textarea form-textarea--code"
                name="apiResponse"
                value={formData.apiResponse}
                onChange={handleChange}
                placeholder='{"error": "message"}'
              />
            </>
          )}

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

        <Section
          sectionKey="attachments"
          title="4. Attachments / Links"
          status={getSectionStatus("attachments")}
          isOpen={openSections.attachments}
          onToggle={toggleSection}
        >
          <label className="form-label">Data Link</label>
          <input
            className="form-input"
            type="text"
            name="dataLink"
            value={formData.dataLink}
            onChange={handleChange}
            placeholder="Paste archival/data link"
          />
          <div className="help-text">
            <a
              href={config.helpLinks.archivalTool}
              target="_blank"
              rel="noopener noreferrer"
            >
              How to use archival tool
            </a>
          </div>

          <label className="form-label">Video Link</label>
          <input
            className="form-input"
            type="text"
            name="videoLink"
            value={formData.videoLink}
            onChange={handleChange}
            placeholder="Paste video link"
          />

          <label className="form-label">Dump Files Link</label>
          <input
            className="form-input"
            type="text"
            name="dumpFilesLink"
            value={formData.dumpFilesLink}
            onChange={handleChange}
            placeholder="Paste dump files link"
          />
          <div className="help-text">
            <a
              href={config.helpLinks.dumpFiles}
              target="_blank"
              rel="noopener noreferrer"
            >
              How to create dump files
            </a>
          </div>
        </Section>

        <Section
          sectionKey="screenshots"
          title="5. Screenshots"
          status={getSectionStatus("screenshots")}
          isOpen={openSections.screenshots}
          onToggle={toggleSection}
        >
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
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          {screenshots.length > 0 && (
            <div className="image-grid">
              {screenshots.map((item, index) => (
                <div key={index} className="image-card">
                  <img
                    src={item.previewUrl}
                    alt={`Screenshot ${index + 1}`}
                    className="image-preview"
                  />
                  <div className="file-name">
                    {item.file.name || `Pasted image ${index + 1}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          sectionKey="preview"
          title="6. Preview"
          isOpen={openSections.preview}
          onToggle={toggleSection}
        >
          <CardPreview formData={formData} screenshots={screenshots} />
        </Section>

        <Section
          sectionKey="faq"
          title="7. Quick Troubleshooting Checklist"
          isOpen={openSections.faq}
          onToggle={toggleSection}
        >
          <div className="tip-box">
            <p className="tip-intro">
              Standard things to check before submitting:
            </p>
            <ul className="tip-list">
              <li>Security: antivirus, firewall, web/content filters</li>
              <li>
                System health: free drive space, RAM, CPU usage, power plan
              </li>
              <li>
                Software conflicts: backup software, file-locking tools, recent
                updates
              </li>
              <li>Access: user permissions, admin rights</li>
              <li>
                Environment: network issues, proxy/filtering,
                customer-specific factors
              </li>
            </ul>
          </div>
        </Section>

        <div className="submit-row">
          <button
            type="button"
            className="submit-button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || isSubmitted}
          >
            {isSubmitting ? "Submitting…" : isSubmitted ? "Submitted ✓" : "Submit Bug Track"}
          </button>
          <button
            type="button"
            className="submit-button submit-button--secondary"
            onClick={clearForm}
            disabled={isSubmitting}
          >
            Clear Form
          </button>
        </div>
        <div className="submit-footer">
          <a href="https://app.fizzy.do" target="_blank" rel="noopener noreferrer">
            Open Fizzy
          </a>
        </div>
      </div>
    </div>
  );
}

function CardPreview({ formData, screenshots }) {
  const hasAnyData = Object.values(formData).some((v) => v.trim?.() || v);

  if (!hasAnyData) {
    return (
      <p className="preview-empty">Fill out the form above to see a preview of your Fizzy card.</p>
    );
  }

  const hasLinks = formData.salesforceLink || formData.dataLink || formData.videoLink || formData.dumpFilesLink;
  const hasEnvironment = formData.machineType || formData.operatingSystem;

  return (
    <div className="card-preview">
      <div className="card-preview-title">
        {formData.problemDescr
          ? <>{formData.priority && <span className="preview-priority">[{formData.priority}]</span>} {formData.problemDescr}</>
          : <span className="preview-placeholder">No title yet</span>}
      </div>

      <div className="card-preview-section">
        <PreviewRow label="Submitted By" value={formData.submitterEmail} />
        <PreviewRow label="Product" value={formData.productCategory} />
        <PreviewRow label="Customer" value={formData.customer} />
        {formData.productCategory === "EBMS" && (
          <PreviewRow label="Version" value={formData.version} />
        )}
      </div>

      {(formData.problemDescr || formData.reproducible) && (
        <div className="card-preview-section">
          <PreviewBlock label="Description of Problem" value={formData.problemDescr} />
          <PreviewRow label="Reproducible" value={formData.reproducible} />
        </div>
      )}

      {formData.steps && (
        <div className="card-preview-section">
          <PreviewBlock label="Steps to Reproduce" value={formData.steps} />
        </div>
      )}

      {(formData.apiEndpoint || formData.requestPayload || formData.apiResponse) && (
        <div className="card-preview-section">
          {formData.apiEndpoint && <PreviewBlock label="API Endpoint" value={formData.apiEndpoint} />}
          {formData.requestPayload && <PreviewCodeBlock label="Request Payload" value={formData.requestPayload} />}
          {formData.apiResponse && <PreviewCodeBlock label="Response" value={formData.apiResponse} />}
        </div>
      )}

      {(formData.observedBehavior || formData.expectedBehavior) && (
        <div className="card-preview-section">
          <PreviewBlock label="Observed Behavior" value={formData.observedBehavior} />
          <PreviewBlock label="Expected Behavior" value={formData.expectedBehavior} />
        </div>
      )}

      {hasEnvironment && (
        <div className="card-preview-section">
          <PreviewRow label="Machine Type" value={formData.machineType} />
          <PreviewRow label="Operating System" value={formData.operatingSystem} />
        </div>
      )}

      {hasLinks && (
        <div className="card-preview-section">
          {formData.salesforceLink && (
            <p className="preview-link-row">
              <strong>Salesforce Ticket:</strong>{" "}
              <a href={formData.salesforceLink} target="_blank" rel="noopener noreferrer">
                {formData.salesforceLink}
              </a>
            </p>
          )}
          {formData.dataLink && (
            <p className="preview-link-row">
              <strong>Data:</strong>{" "}
              <a href={formData.dataLink} target="_blank" rel="noopener noreferrer">
                {formData.dataLink}
              </a>
            </p>
          )}
          {formData.videoLink && (
            <p className="preview-link-row">
              <strong>Video:</strong>{" "}
              <a href={formData.videoLink} target="_blank" rel="noopener noreferrer">
                {formData.videoLink}
              </a>
            </p>
          )}
          {formData.dumpFilesLink && (
            <p className="preview-link-row">
              <strong>Dump Files:</strong>{" "}
              <a href={formData.dumpFilesLink} target="_blank" rel="noopener noreferrer">
                {formData.dumpFilesLink}
              </a>
            </p>
          )}
        </div>
      )}

      {screenshots.length > 0 && (
        <div className="card-preview-section">
          <p className="preview-screenshots-label">
            <strong>Screenshots:</strong> {screenshots.length} attached
          </p>
          <div className="preview-image-strip">
            {screenshots.map((item, index) => (
              <img
                key={index}
                src={item.previewUrl}
                alt={`Screenshot ${index + 1}`}
                className="preview-image-thumb"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewRow({ label, value }) {
  if (!value) return null;
  return (
    <p className="preview-row">
      <strong>{label}:</strong> {value}
    </p>
  );
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

  if (filled === total) {
    return <span className="section-badge section-badge--done">✓ {total}/{total}</span>;
  }

  if (optional) {
    return <span className="section-badge section-badge--optional">{filled}/{total}</span>;
  }

  return <span className="section-badge section-badge--partial">{filled}/{total}</span>;
}

function Section({ sectionKey, title, isOpen, onToggle, children, status }) {
  return (
    <div className="card">
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="section-header"
      >
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