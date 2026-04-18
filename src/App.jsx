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

  const [formData, setFormData] = useState({
    productCategory: "",
    customer: "",
    version: "",
    machineType: "",
    operatingSystem: "",
    problemDescr: "",
    reproducible: "",
    steps: "",
    observedBehavior: "",
    expectedBehavior: "",
    dataLink: "",
    videoLink: "",
    dumpFilesLink: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggleSection(sectionName) {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
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
  const title = formData.problemDescr.trim();

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

  if (formData.steps) {
    description += `
      <div style="margin-top:16px;">
        <p><strong>Steps to Reproduce:</strong><br>${formatMultiline(formData.steps)}</p>
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

  if (formData.dataLink || formData.videoLink || formData.dumpFilesLink) {
    description += `
      <div style="margin-top:16px;">
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

  if (screenshots.length > 0) {
    description += `
      <div style="margin-top:16px;">
        <p><strong>Screenshots:</strong> ${screenshots.length} attached</p>
      </div>
    `;
  }

  return {
    boardId,
    title,
    body: description.trim(),
  };
}

  async function handleSubmit() {
    const payload = buildFizzyCardPayload();

    try {
      const response = await fetch (`${import.meta.env.VITE_API_BASE_URL}/createbugrack`, {
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

      alert("Bug track payload sent successfully.");
    } catch (error) {
      console.error("Submit failed - full error:", error);
      console.error("Error message:", error?.message);
      alert("Could not reach the Azure Function.");
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Koble Bug Track</h1>
        <p className="page-subtitle">
          This form is used as a template to submit bug tracks
        </p>

        <Section
          sectionKey="context"
          title="1. Context"
          isOpen={openSections.context}
          onToggle={toggleSection}
        >
          <label className="form-label">Product Category *</label>
          <select
            className="form-input"
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

          <label className="form-label">Customer *</label>
          <input
            className="form-input"
            type="text"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            placeholder="Customer name or account"
          />

          <label className="form-label">Version *</label>
          <input
            className="form-input"
            type="text"
            name="version"
            value={formData.version}
            onChange={handleChange}
            placeholder="Example: 8.6.239.049"
          />
        </Section>

        <Section
          sectionKey="environment"
          title="2. Environment"
          isOpen={openSections.environment}
          onToggle={toggleSection}
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
          isOpen={openSections.reproduction}
          onToggle={toggleSection}
        >
          <label className="form-label">Description of Problem *</label>
          <textarea
            className="form-textarea"
            name="problemDescr"
            value={formData.problemDescr}
            onChange={handleChange}
            placeholder="EBMS won't open"
          />

          <label className="form-label">Reproducible *</label>
          <select
            className="form-input"
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
            className="form-textarea"
            name="observedBehavior"
            value={formData.observedBehavior}
            onChange={handleChange}
            placeholder="What happened?"
          />

          <label className="form-label">Expected Behavior *</label>
          <textarea
            className="form-textarea"
            name="expectedBehavior"
            value={formData.expectedBehavior}
            onChange={handleChange}
            placeholder="What should have happened instead?"
          />
        </Section>

        <Section
          sectionKey="attachments"
          title="4. Attachments / Links"
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
          isOpen={openSections.screenshots}
          onToggle={toggleSection}
        >
          <div className="help-text">
            You can paste a screenshot here with Ctrl+V or upload image files.
          </div>

          <div className="paste-zone" onPaste={handlePaste} tabIndex={0}>
            Click here, then paste a screenshot from your clipboard.
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
          <p className="preview-text">
            Later, this is where we can show a summary before sending the card
            to Fizzy.
          </p>
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

        <button type="button" className="submit-button" onClick={handleSubmit}>
          Submit Bug Track
        </button>
      </div>
    </div>
  );
}

function Section({ sectionKey, title, isOpen, onToggle, children }) {
  return (
    <div className="card">
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="section-header"
      >
        <span>{title}</span>
        <span className="chevron">{isOpen ? "▾" : "▸"}</span>
      </button>

      {isOpen && <div className="section-body">{children}</div>}
    </div>
  );
}