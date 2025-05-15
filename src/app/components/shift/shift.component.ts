import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-shift',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.css'],
})
export class ShiftComponent implements AfterViewInit {
  @ViewChild('shiftId') shiftIdInput!: ElementRef;

  constructor(private http: HttpClient,private authService:AuthService) {}

  disableFields = true;
  deduct2Punch = false;
  deduct2PlusPunch = false;
  isAccordionOpen = true;
  includeGrace = true;
  shiftList: any[] = []; // To display the list of shifts with ID and Name
  selectedIndex: number | null = null; // Track selected index for update
  successMessage: string = '';
  searchTerm: string = '';
  filteredList: any[] = [];
  alertMessage: string = '';
  alertType: string = ''; // 'success' or 'danger'
  showAlert: boolean = false;

  rights: any = {};
  username: string = '';

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  paginatedUsers: any[] = [];

    isEditMode: boolean = false; // ✅ Add this line
    isNewMode: boolean = false; // if used
    // hasEditPermission:boolean=false;
    
  

  shift: any = {
    Id: '',
    Name: '',
    Description: '',
    Type: 'Normal',
    StartTime: '',
    EndTime: '',
    Duration: '',
    AttendanceType: 'Shift-Based',
  };

  workingHours = {
    HalfDay: '',
    FullDay: '',
    MinHoursRequired: false,
    DeviationStart: '',
    DeviationEnd: '',
    ShiftAllowance: false,
  };

  breakDetails = {
    BreakStart: '',
    BreakEnd: '',
    BreakDuration: '00:00',
    DeviationAllowed: true,
    AddLateIn: false,
    AddEarlyOut: false,
    Deduct2Punch: false,
    Deduct2PunchType: 'configured',
    Deduct2PlusPunch: false,
    Deduct2PlusPunchType: 'actual',
  };

  workShiftDetails: {
    IncludeGraceTime: boolean;
    ShiftLateIn: number | null;
    ShiftLateInOverlap: boolean;
    ShiftEarlyOut: number | null;
    ShiftEarlyOutOverlap: boolean;
    BreakLateIn: number | null;
    BreakLateInOverlap: boolean;
    BreakEarlyOut: number | null;
    BreakEarlyOutOverlap: boolean;
    minHoursRequired: boolean;
  } = {
    IncludeGraceTime: true,
    ShiftLateIn: 0,
    ShiftLateInOverlap: false,
    ShiftEarlyOut: 0,
    ShiftEarlyOutOverlap: false,
    BreakLateIn: 0,
    BreakLateInOverlap: false,
    BreakEarlyOut: 0,
    BreakEarlyOutOverlap: false,
    minHoursRequired: false,
  };

  // ngOnInit(): void {
  //   this.loadShiftData();
  //   this.setFocus();
  // }
  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.authService.getPageRights(this.username).subscribe((data) => {
      const shiftRights = data.find((r: any) => r.name.toLowerCase() === 'shift configuration');
      this.rights = shiftRights || {};
      this.authService.setRights('shift', this.rights); // Optional: store for other usage
    });

    if (this.validateToken()) {
      // this.getShifts();
      this.loadShiftData();
      this.setFocus();
      setTimeout(() => this.shiftIdInput?.nativeElement.focus(), 500);
    }
  }

  updatePaginatedUsers():void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredList.slice(
      start,
      start + this.itemsPerPage
    );
    this.totalPages = Math.ceil(this.filteredList.length / this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedUsers();
    }
  }
  
  canView() {
    return this.rights.view;
  }

  canAdd() {
    return this.rights.add;
  }

  canEdit() {
    return this.rights.edit;
  }

  canDelete() {
    return this.rights.delete;
  }

  validateToken(): boolean {
    // Your token logic here
    return true;
  }

  loadShiftData(): void {
    this.http.get<any[]>('http://192.168.28.44:5234/api/shift').subscribe({
      next: (data) => {
        console.log(' Shift data loaded:', data);
        this.shiftList = data;
        this.filteredList = data; // Initialize filteredList with all data
        // this.filteredUsers = [...res];
        this.updatePaginatedUsers();
      },
      error: (err) => {
        console.error(' Error loading shift data:', err);
      },
    });
  }

  filterList():void{
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredList = this.shiftList.filter((item) =>
      item.name.toLowerCase().includes(term) ||
    item.id.toString().toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }
  // user.id.toString().toLowerCase().includes(term)

  populateInputFields(item: any, index?: number): void {
    if (!this.canEdit()) return;
    this.shift = {
      Id: item.id || '',
      Name: item.name || '',
      Description: item.description || '',
      Type: item.type || 'Normal',
      StartTime: item.startTime || '',
      EndTime: item.endTime || '',
      Duration: item.duration || '',
      AttendanceType: item.attendanceType || 'Shift-Based',
    };

    this.workingHours = {
      HalfDay: item.halfDay || '',
      FullDay: item.fullDay || '',
      MinHoursRequired: item.minHoursRequired || false,
      DeviationStart: item.deviationStart || '',
      DeviationEnd: item.deviationEnd || '',
      ShiftAllowance: item.shiftAllowance || false,
    };

    this.breakDetails = {
      BreakStart: item.breakStart || '',
      BreakEnd: item.breakEnd || '',
      BreakDuration: item.breakDuration || '00:00',
      DeviationAllowed: item.deviationAllowed ?? true,
      AddLateIn: item.addLateIn || false,
      AddEarlyOut: item.addEarlyOut || false,
      Deduct2Punch: item.deduct2Punch || false,
      Deduct2PunchType: item.deduct2PunchType || 'configured',
      Deduct2PlusPunch: item.deduct2PlusPunch || false,
      Deduct2PlusPunchType: item.deduct2PlusPunchType || 'actual',
    };

    this.workShiftDetails = {
      IncludeGraceTime: item.includeGraceTime ?? true,
      ShiftLateIn: item.shiftLateIn ?? 0,
      ShiftLateInOverlap: item.shiftLateInOverlap || false,
      ShiftEarlyOut: item.shiftEarlyOut ?? 0,
      ShiftEarlyOutOverlap: item.shiftEarlyOutOverlap || false,
      BreakLateIn: item.breakLateIn ?? 0,
      BreakLateInOverlap: item.breakLateInOverlap || false,
      BreakEarlyOut: item.breakEarlyOut ?? 0,
      BreakEarlyOutOverlap: item.breakEarlyOutOverlap || false,
      minHoursRequired: item.minHoursRequired || false,
    };

    this.isEditMode=true; // Set index here
    this.disableFields = false;
    this.setFocus();
  }

  deleteShift(id: number): void {
    if (confirm('Are you sure you want to delete this shift?')) {
      this.http.delete(`http://192.168.28.44:5234/api/shift/${id}`).subscribe({
        next: () => {
          this.alertMessage = 'Shift deleted successfully.';
          this.alertType = 'success';
          this.showAlert = true;

          this.resetFields();
          this.loadShiftData(); // Refresh list
        },
        error: (err) => {
          this.alertMessage = ' Error deleting shift. Please try again.';
          this.alertType = 'danger';
          this.showAlert = true;

          console.error('Error deleting shift:', err);
        },
      });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.setFocus(), 100);
  }

  setFocus(): void {
    if (this.shiftIdInput?.nativeElement) {
      this.shiftIdInput.nativeElement.focus();
    }
  }

  onNew(): void {
    this.resetFields(false);
    this.clearGraceTimeInputs();
    this.setFocus();
  }

  refreshBtn(): void {
    this.resetFields(true);
    this.setFocus();
  }

  resetFields(disable: boolean = true): void {
    this.shift = {
      Id: '',
      Name: '',
      Description: '',
      Type: 'Normal',
      StartTime: '',
      EndTime: '',
      Duration: '',
      AttendanceType: 'Shift-Based',
    };

    this.workingHours = {
      HalfDay: '',
      FullDay: '',
      MinHoursRequired: false,
      DeviationStart: '',
      DeviationEnd: '',
      ShiftAllowance: false,
    };

    this.breakDetails = {
      BreakStart: '',
      BreakEnd: '',
      BreakDuration: '00:00',
      DeviationAllowed: true,
      AddLateIn: false,
      AddEarlyOut: false,
      Deduct2Punch: false,
      Deduct2PunchType: 'configured',
      Deduct2PlusPunch: false,
      Deduct2PlusPunchType: 'actual',
    };

    this.workShiftDetails = {
      IncludeGraceTime: true,
      ShiftLateIn: 0,
      ShiftLateInOverlap: false,
      ShiftEarlyOut: 0,
      ShiftEarlyOutOverlap: false,
      BreakLateIn: 0,
      BreakLateInOverlap: false,
      BreakEarlyOut: 0,
      BreakEarlyOutOverlap: false,
      minHoursRequired: false,
    };

    this.disableFields = disable;
  }

  clearGraceTimeInputs(): void {
    this.workShiftDetails.ShiftLateIn = null;
    this.workShiftDetails.ShiftEarlyOut = null;
    this.workShiftDetails.BreakLateIn = null;
    this.workShiftDetails.BreakEarlyOut = null;
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode < 48 || charCode > 57) &&
      charCode !== 8 &&
      charCode !== 9 &&
      charCode !== 46
    ) {
      event.preventDefault();
    }
  }

  validateRange(): void {
    const maxVal = 999;
    const DeviationStartNum = Number(this.workingHours.DeviationStart || '0');
    const DeviationEndNum = Number(this.workingHours.DeviationEnd || '0');

    if (DeviationStartNum > maxVal) {
      this.workingHours.DeviationStart = maxVal.toString();
    }

    if (DeviationEndNum > maxVal) {
      this.workingHours.DeviationEnd = maxVal.toString();
    }
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  calculateDuration(): void {
    if (this.shift.StartTime && this.shift.EndTime) {
      const [startHour, startMinute] =
        this.shift.StartTime.split(':').map(Number);
      const [endHour, endMinute] = this.shift.EndTime.split(':').map(Number);

      let start = startHour * 60 + startMinute;
      let end = endHour * 60 + endMinute;

      if (end < start) {
        end += 24 * 60;
      }

      const durationMinutes = end - start;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      this.shift.Duration = `${this.pad(hours)}:${this.pad(minutes)}`;
    } else {
      this.shift.Duration = '';
    }
  }

  onShiftIdKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab' || event.key === 'Enter') {
      const matchedItemIndex = this.filteredList.findIndex(
        (item: any) => item.id == this.shift.Id
      );
  
      if (matchedItemIndex !== -1) {
        event.preventDefault(); // prevent focus change
        const matchedItem = this.filteredList[matchedItemIndex];
  
        this.populateInputFields(matchedItem);
  
        // ✅ Set selectedIndex so Save() knows it's an edit
        this.selectedIndex = matchedItemIndex;
  
        // Optional: set edit mode flag if you use one
        this.isEditMode = true;
      } else {
        // No matching record found
        this.selectedIndex = null;
        this.isEditMode = false;
      }
    }
  }
  

  Save() {
    const finalShiftData = {
      ...this.shift,
      ...this.workingHours,
      ...this.breakDetails,
      ...this.workShiftDetails,
    };

    const isEdit = !!this.shift.Id;

    const apiUrl = 'http://192.168.28.44:5234/api/shift';

    if (!isEdit) {
      delete finalShiftData.Id; // Let DB assign ID
    }

    const request = isEdit
      ? this.http.put(`${apiUrl}/${this.shift.Id}`, finalShiftData)
      : this.http.post(apiUrl, finalShiftData);

    request.subscribe({
      next: (res) => {
        // alert('hey')
        console.log(isEdit ? 'Shift updated:' : 'Shift created:', res);
        // this.resetFields();
        this.selectedIndex = null;
        this.loadShiftData();

        this.successMessage = isEdit
          ? 'Shift updated successfully!'
          : 'Shift created successfully!';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving shift:', err);
      },
    });
  }
}


// onShiftIdKeyDown(event: KeyboardEvent): void {
//   if (event.key === 'Tab' || event.key === 'Enter') {
//     const matchedItemIndex = this.filteredList.findIndex(
//       (item: any) => item.id == this.shift.Id
//     );

//     if (matchedItemIndex !== -1) {
//       event.preventDefault(); // prevent focus change
//       const matchedItem = this.filteredList[matchedItemIndex];

//       this.populateInputFields(matchedItem);

//       // ✅ Set selectedIndex so Save() knows it's an edit
//       this.selectedIndex = matchedItemIndex;

//       // Optional: set edit mode flag if you use one
//       // this.isEditMode = true;
//     } else {
//       // No matching record found
//       this.selectedIndex = null;
//       // this.isEditMode = false;
//     }
//   }
// }