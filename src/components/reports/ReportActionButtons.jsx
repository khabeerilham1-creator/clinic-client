import React from "react";

function ReportActionButtons({ onPrint, onEdit, onDelete, size = "sm" }) {
  return (
    <div className="row-actions no-print">
      {onPrint && (
        <button className={`btn btn-${size}`} type="button" onClick={onPrint}>
          Print
        </button>
      )}
      {onEdit && (
        <button className={`btn btn-${size}`} type="button" onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button className={`btn btn-${size} btn-danger`} type="button" onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  );
}

export default ReportActionButtons;
