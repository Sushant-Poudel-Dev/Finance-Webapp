import { useState } from "react";
import html2canvas from "html2canvas";
import { IconButton, CircularProgress, Tooltip } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { toast } from "react-toastify";

const ScreenshotButton = ({ elementId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleScreenshot = async () => {
    try {
      setIsLoading(true);
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error("Element not found");
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#050505", // Match your dark theme background
        useCORS: true,
        scale: 2, // Adjusted quality
        logging: false,
        onclone: (clonedDoc) => {
          // Fix background colors and text colors in cloned element
          const clonedElement = clonedDoc.getElementById(elementId);
          const allElements = clonedElement.getElementsByTagName("*");

          // Convert CSS variables to actual colors
          for (let el of allElements) {
            const styles = window.getComputedStyle(el);
            el.style.backgroundColor = styles.backgroundColor;
            el.style.color = styles.color;
            el.style.borderColor = styles.borderColor;

            // Special handling for table elements
            if (el.tagName === "TD") {
              el.style.color = "#fafcff";
              if (el === el.parentElement.lastElementChild) {
                el.style.color = "var(--secondary-color)";
              }
            }
            if (el.tagName === "TH") {
              el.style.color = "var(--secondary-color)";
              el.style.fontWeight = "600";
            }

            // Fix charts if they exist
            if (el.tagName === "CANVAS") {
              el.style.background = "transparent";
            }
          }

          // Ensure the main element has background
          clonedElement.style.backgroundColor = "#050505";
          clonedElement.style.color = "#fafcff";

          // Ensure list backgrounds
          const lists = clonedElement.getElementsByClassName("incomeList");
          for (let list of lists) {
            list.style.backgroundColor = "#050505";
          }
        },
      });

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      const formData = new FormData();
      formData.append("file", blob, "screenshot.png");

      const response = await fetch("http://localhost:8000/send-screenshot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save screenshot");
      }

      toast.success("Screenshot saved successfully!");
    } catch (error) {
      console.error("Screenshot error:", error);
      toast.error(error.message || "Failed to save screenshot");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip title='Take Screenshot'>
      <IconButton
        onClick={handleScreenshot}
        disabled={isLoading}
        style={{ color: "var(--primary-color)" }}
      >
        {isLoading ? <CircularProgress size={24} /> : <CameraAltIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ScreenshotButton;
