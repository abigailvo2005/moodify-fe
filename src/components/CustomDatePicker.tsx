// import React from "react";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { View } from "react-native";
// import { GradientButton } from "./GradientButton";

// export type CustomDatePickerProps = {
//   dob: Date;
//   setDob: (date: Date) => void;
//   toggleDatePicker: () => void;
// };

// export const CustomDatePicker = ({
//   dob,
//   setDob,
//   toggleDatePicker,
// }: CustomDatePickerProps) => {
//   return (
//     <View
//       style={{
//         position: "absolute",
//         justifyContent: "center",
//         alignItems: "center",
//         zIndex: 10,
//       }}
//     >
//       <View
//         style={{
//           backgroundColor: "#c9819f",
//           opacity: 1,
//           borderRadius: 16,
//           padding: 20,
//           width: "100%",
//           alignItems: "center",
//           shadowColor: "#000",
//           shadowOffset: {
//             width: 0,
//             height: 2,
//           },
//           shadowOpacity: 0.5,
//           shadowRadius: 4,
//           elevation: 5,
//           marginTop: -330,
//         }}
//       >
//         <DateTimePicker
//           value={dob}
//           mode="date"
//           display="spinner"
//           onChange={(event, selectedDate) => {
//             if (event.type === "set" && selectedDate) {
//               setDob(selectedDate);
//             } else if (event.type === "dismissed") {
//               toggleDatePicker();
//             }
//           }}
//           maximumDate={new Date()}
//         />
//         <GradientButton
//           text="OK"
//           navFunc={toggleDatePicker}
//           style={{ width: 150, height: 50,}}
//         />
//       </View>
//     </View>
//   );
// };

// src/components/CustomDatePicker.tsx - UPDATED VERSION
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Dimensions, Modal, Platform, StyleSheet, View } from "react-native";
import { GradientButton } from "./GradientButton";

const { width, height } = Dimensions.get("window");

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
  // ✅ Handle date change for both platforms
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      // Android: DatePicker closes automatically after selection
      toggleDatePicker();

      if (event.type === "set" && selectedDate) {
        setDob(selectedDate);
      }
      // If user cancels (event.type === 'dismissed'), do nothing
    } else {
      // iOS: Keep picker open, only update date
      if (selectedDate) {
        setDob(selectedDate);
      }
    }
  };

  // ✅ Android: Return native modal
  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={dob}
        mode="date"
        display="spinner"
        onChange={handleDateChange}
        maximumDate={new Date()}
      />
    );
  }

  // ✅ iOS: Return custom modal
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={true}
      onRequestClose={toggleDatePicker}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={[styles.pickerContainer]}>
            <DateTimePicker
              value={dob}
              mode="date"
              display="spinner" // ✅ iOS can use spinner
              onChange={handleDateChange}
              maximumDate={new Date()}
              style={styles.iosDatePicker}
            />
            <GradientButton
              text="OK"
              navFunc={toggleDatePicker}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ✅ Modal styles for iOS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center" as const,
  },

  modalContent: {
    width: width * 0.9,
    maxWidth: 350,
  },

  pickerContainer: {
    backgroundColor: "#c9819f",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  iosDatePicker: {
    backgroundColor: "transparent",
    width: "100%",
  },

  okButton: {
    width: 150,
    height: 50,
    marginTop: 15,
  },
});
