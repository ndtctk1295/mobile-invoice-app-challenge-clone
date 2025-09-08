import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, useColorScheme } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    minWidth: 300,
    maxWidth: 350,
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  navButtonText: {
    color: colors.muted,
    fontSize: 18,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedDayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  selectedDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  closeButtonText: {
    color: colors.muted,
  },
});

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

export function DatePicker({ visible, onClose, onSelectDate, selectedDate }: DatePickerProps) {
  const colorScheme  = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      return new Date(selectedDate);
    }
    return new Date();
  });

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Format date manually to avoid timezone issues with toISOString()
    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${dayStr}`; // YYYY-MM-DD format
    onSelectDate(formattedDate);
    onClose();
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return (
      selected.getFullYear() === currentDate.getFullYear() &&
      selected.getMonth() === currentDate.getMonth() &&
      selected.getDate() === day
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          {/* Header with month/year and navigation */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <ThemedText style={styles.navButtonText}>‹</ThemedText>
            </TouchableOpacity>
            
            <ThemedText style={styles.monthYear}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </ThemedText>
            
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <ThemedText style={styles.navButtonText}>›</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Days of week header */}
          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day, index) => (
              <View key={index} style={styles.dayOfWeekCell}>
                <ThemedText style={styles.dayOfWeekText}>{day}</ThemedText>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={day && isSelectedDate(day) ? styles.selectedDayCell : styles.dayCell}
                onPress={() => day && handleDateSelect(day)}
                disabled={!day}
              >
                {day && (
                  <ThemedText style={day && isSelectedDate(day) ? styles.selectedDayText : styles.dayText}>
                    {day}
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}
