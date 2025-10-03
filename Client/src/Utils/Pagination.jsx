import React from "react";
import { Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => {
  if (totalPages <= 1) return null; 

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem", gap: "1rem" }}>
      <Button
        variant="outlined"
        onClick={onPrev}
        disabled={currentPage === 1}
        startIcon={<ArrowBack />}
      >
        Prev
      </Button>

      <span style={{ alignSelf: "center" }}>
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outlined"
        onClick={onNext}
        disabled={currentPage === totalPages}
        endIcon={<ArrowForward />}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
