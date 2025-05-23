import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, View } from "react-native";
import { GradientButton } from "./GradientButton";

export type CustomDatePickerProps = {
  dob: Date;
  setDob: (date: Date) => void;
  toggleDatePicker: () => void;
};

export const CustomDatePicker = ({
  dob,
  setDob,
  toggleDatePicker,
}: CustomDatePickerProps) => {
  return (
    <View
      style={{
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <View
        style={{
          backgroundColor: "#ebc5d9",
          borderRadius: 16,
          padding: 20,
          width: "100%",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 5,
          marginTop: -330,
        }}
      >
        <DateTimePicker
          value={dob}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (event.type === "set" && selectedDate) {
              setDob(selectedDate);
            } else if (event.type === "dismissed") {
              toggleDatePicker();
            }
          }}
          maximumDate={new Date()}
        />
        <GradientButton
          text="OK"
          navFunc={toggleDatePicker}
          style={{ width: 150, height: 50,}}
        />
      </View>
    </View>
  );
};
