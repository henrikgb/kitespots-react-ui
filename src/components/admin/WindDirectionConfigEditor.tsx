import React from "react";
import { Button, Input, Option, Select } from "@material-tailwind/react";
import { useTranslation } from "next-i18next";
import { WIND_CONDITION_LIST } from "@/domain/windCondition";

export interface WindDirectionRowInput {
  intervalStart: string;
  intervalStop: string;
  category: string;
}

export const emptyWindDirectionRow = (): WindDirectionRowInput => ({
  intervalStart: "",
  intervalStop: "",
  category: "",
});

interface WindDirectionConfigEditorProps {
  rows: WindDirectionRowInput[];
  onChange: (rows: WindDirectionRowInput[]) => void;
}

/**
 * Repeatable editor for a location's wind-direction degree-sector configuration - preserves
 * the existing interval/category model (see WindDirectionDescription) rather than switching to
 * cardinal/intercardinal directions. colorCode is intentionally not editable here - the server
 * always derives it from the canonical WIND_CONDITIONS mapping for the chosen category.
 */
export const WindDirectionConfigEditor = ({ rows, onChange }: WindDirectionConfigEditorProps) => {
  const { t } = useTranslation();

  const updateRow = (index: number, patch: Partial<WindDirectionRowInput>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, emptyWindDirectionRow()]);
  };

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={index} className="flex flex-row gap-2 items-end flex-wrap">
          <div className="w-24">
            <Input
              type="number"
              label={t("startDegrees")}
              value={row.intervalStart}
              onChange={(e) => updateRow(index, { intervalStart: e.target.value })}
              min={0}
              max={360}
            />
          </div>
          <div className="w-24">
            <Input
              type="number"
              label={t("endDegrees")}
              value={row.intervalStop}
              onChange={(e) => updateRow(index, { intervalStop: e.target.value })}
              min={0}
              max={360}
            />
          </div>
          <div className="w-64">
            <Select
              label={t("windCategory")}
              value={row.category}
              onChange={(value) => updateRow(index, { category: value ?? "" })}
            >
              {WIND_CONDITION_LIST.map((condition) => (
                <Option key={condition.category} value={condition.category}>
                  {t(condition.id)}
                </Option>
              ))}
            </Select>
          </div>
          <Button
            variant="text"
            color="red"
            className="mb-2"
            onClick={() => removeRow(index)}
            aria-label={t("removeInterval")}
          >
            {t("removeInterval")}
          </Button>
        </div>
      ))}
      <Button variant="outlined" className="w-fit" onClick={addRow}>
        {t("addInterval")}
      </Button>
    </div>
  );
};
