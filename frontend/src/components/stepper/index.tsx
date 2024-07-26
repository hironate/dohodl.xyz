import { Step, StepLabel, Stepper } from "@mui/material";
import React from "react";

const CustomStepper = ({ steps = [] }) => {
  return (
    <div>
      <Stepper activeStep={1} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default CustomStepper;
