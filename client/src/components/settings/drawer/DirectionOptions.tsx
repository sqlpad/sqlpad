import React from "react";
// @mui
import { RadioGroup } from "@mui/material"
//
import SvgColor from "../../svg-color"
import { useSettingsContext } from "../SettingsContext"
import { StyledCard, StyledWrap, MaskControl } from "../styles"

// ----------------------------------------------------------------------

const OPTIONS = ["ltr", "rtl"] as const

export default function DirectionOptions() {
  const { themeDirection, onChangeDirection } = useSettingsContext()

  return (
    <RadioGroup name="themeDirection" value={themeDirection} onChange={onChangeDirection}>
      <StyledWrap>
        {OPTIONS.map((direction) => (
          <StyledCard key={direction} selected={themeDirection === direction}>
            <SvgColor src={`/assets/icons/setting/${direction === "rtl" ? "ic_align_right" : "ic_align_left"}.svg`} />

            <MaskControl value={direction} />
          </StyledCard>
        ))}
      </StyledWrap>
    </RadioGroup>
  )
}
