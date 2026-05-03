import { useAcademicStore } from '../stores/useAcademicStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { usePrintSettings } from '../hooks/usePrintSettings';
import { exportTableToExcel } from '../utils/excelUtils';
import { createTableTemplate, generatePDFFromHTML, generatePDFFromHTMLFallback } from '../utils/pdfUtils';
import DatabaseErrorAlert from '../components/DatabaseErrorAlert';
import { useProfessors } from '../hooks/queries/useProfessors';
import { useCourses } from '../hooks/queries/useCourses';
import { useRooms } from '../hooks/queries/useRooms';
import { useGroups } from '../hooks/queries/useGroups';
import { useAssignments, useDeleteAssignment } from '../hooks/queries/useAssignments';

// Interfaces pour les types de données
interface Professor {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  academic_title?: string;
}

interface Course {
  id: number;
  name: string;
  code?: string;
}

interface Group {
  id: number;
  name: string;
  specialization?: string;
}

interface Room {
  id: number;
  name: string;
}

interface Assignment {
  id: number;
  professor_id: number;
  course_id: number;
  group_id: number;
  room_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  academic_year?: string;
  semester?: string;
}

interface AssignmentWithDetails extends Assignment {
  professorName: string;
  courseName: string;
  groupName: string;
  groupSpecialization: string;
  roomName: string;
  lecture_time: string;
  dayName: string;
}

// Fonction utilitaire pour traduire les titres académiques
const translateProfessorTitle = (title: string): string => {
  const titles: { [key: string]: string } = {
    'PROF': 'أستاذ',
    'MC': 'أستاذ محاضر',
    'MAA': 'أستاذ مساعد',
    'MAB': 'أستاذ مساعد ب',
    'MCB': 'أستاذ محاضر ب',
    'PROFB': 'أستاذ ب',
    'VAC': 'أستاذ زائر',
    'ASS': 'معيد',
    'DR': 'دكتور',
    'ING': 'مهندس',
    'MRS': 'السيدة',
    'MR': 'السيد'
  };
  return titles[title] || title;
};

// Fonction utilitaire pour convertir le jour en arabe
const convertDay = (day: number): string => {
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  return days[day] || 'يوم غير محدد';
};

// Fonction utilitaire pour gérer les erreurs
const handleError = (error: any): Error => {
  console.error('Erreur:', error);
  if (error instanceof Error) {
    return error;
  }
  return new Error('Une erreur inconnue est survenue');
};

// Fonction utilitaire pour comparer les chaînes en arabe
const arabicCompare = (a: string, b: string): number => {
  return a.localeCompare(b, 'ar');
};

const Sessions: React.FC = () => {
  return (
    <SessionsContent />
  );
};

// Composant principal avec le contenu
const SessionsContent = () => {
  // Stores & Queries
  const { currentYear, currentSemester } = useAcademicStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const { data: professors = [] } = useProfessors();
  const { data: courses = [] } = useCourses();
  const { data: rooms = [] } = useRooms();
  const { data: groups = [] } = useGroups();
  
  const { 
    data: assignments = [], 
    isLoading: loading, 
    error: scheduleError 
  } = useAssignments(
    currentYear?.year_name || '',
    currentSemester?.semester_name || ''
  );

  const { mutateAsync: storeDeleteAssignment } = useDeleteAssignment();

  // Sorting state
  const [sortColumn, setSortColumn] = useState<keyof AssignmentWithDetails | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [filteredSessions, setFilteredSessions] = useState<AssignmentWithDetails[]>([]);
  const [filterDay, setFilterDay] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterGroupSpecialization, setFilterGroupSpecialization] = useState('');
  const [filterProfessor, setFilterProfessor] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // قائمة توقيتات المحاضرات مرتبة
  const lectureTimes = [
    '8.00 - 9.30',
    '9.30 - 11.00',
    '11.00 - 12.30',
    '12.30 - 14.00',
    '14.00 - 15.30',
    '15.30 - 17.00'
  ];

  // fetchData removed (handled by TanStack Query)


  const sessionsWithDetails = useMemo(() => {
    return assignments.map(assignment => {
      const professor = professors.find(p => p.id === assignment.professor_id);
      const course = courses.find(c => c.id === assignment.course_id);
      const group = groups.find(g => g.id === assignment.group_id);
      const room = rooms.find(r => r.id === assignment.room_id);

      if (!professor || !course || !group || !room) return null;

      return {
        ...assignment,
        professorName: professor.name || '',
        courseName: course.name,
        groupName: group.name,
        groupSpecialization: group.specialization || '',
        roomName: room.name,
        lecture_time: `${assignment.start_time} - ${assignment.end_time}`,
        dayName: convertDay(assignment.day_of_week)
      };
    }).filter((a): a is AssignmentWithDetails => a !== null);
  }, [assignments, professors, courses, groups, rooms]);

  // Apply filters whenever filter state or sessions change
  useEffect(() => {
    applyFilters();
  }, [
    sessionsWithDetails,
    filterDay,
    filterRoom,
    filterGroupSpecialization,
    currentYear,
    currentSemester
  ]);

  const applyFilters = (professorFilter?: string) => {
    let result = sessionsWithDetails;

    // Filter by day
    if (filterDay) {
      result = result.filter(session =>
        session.dayName === filterDay
      );
    }

    // Filter by room
    if (filterRoom) {
      result = result.filter(session =>
        session.roomName === filterRoom
      );
    }

    // Filter by group specialization
    if (filterGroupSpecialization) {
      console.log(`Filtering by specialization: ${filterGroupSpecialization}`);
      result = result.filter(session => {
        const matchesSpecialization = session.groupSpecialization === filterGroupSpecialization;
        // Also include lecture groups when filtering by specialization
        const isLectureGroup = session.groupName.includes('محاضرة');
        return matchesSpecialization || isLectureGroup;
      });
    }

    // Filter by academic year and semester
    if (currentYear && currentSemester) {
      result = result.filter(session =>
        session.academic_year === currentYear.year_name &&
        session.semester === currentSemester.semester_name
      );
    }

    // Filter by professor name (including partial search)
    // استخدام professorFilter إذا تم تمريره، وإلا استخدام filterProfessor
    const currentProfessorFilter = professorFilter !== undefined ? professorFilter : filterProfessor;

    if (currentProfessorFilter) {
      result = result.filter(session =>
        session.professorName?.includes(currentProfessorFilter)
      );
    }

    // Additional search for professors - نستخدم هذا فقط إذا لم يكن هناك فلترة للأستاذ
    if (searchTerm && !currentProfessorFilter) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(session =>
        session.professorName?.toLowerCase().includes(searchTermLower)
      );
    }

    console.log(`Filtered sessions count: ${result.length}`);
    setFilteredSessions(result);
  };

  // Advanced sorting function
  const sortedAndFilteredSessions = React.useMemo(() => {
    let result = filteredSessions;

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        // Special handling for professor name
        if (sortColumn === 'professorName') {
          return sortDirection === 'asc'
            ? arabicCompare(String(valueA || ''), String(valueB || ''))
            : arabicCompare(String(valueB || ''), String(valueA || ''));
        }

        // Special handling for lecture time
        if (sortColumn === 'lecture_time') {
          const indexA = lectureTimes.indexOf(String(valueA || ''));
          const indexB = lectureTimes.indexOf(String(valueB || ''));

          return sortDirection === 'asc'
            ? indexA - indexB
            : indexB - indexA;
        }

        // Default sorting for other columns
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc'
            ? arabicCompare(valueA, valueB)
            : arabicCompare(valueB, valueA);
        }

        // Fallback for non-string values
        return 0;
      });
    }

    return result;
  }, [filteredSessions, sortColumn, sortDirection, lectureTimes]);

  // Sortable header component
  const SortableHeader = ({
    column,
    children
  }: {
    column: keyof AssignmentWithDetails,
    children: React.ReactNode
  }) => {
    const isSorted = sortColumn === column;
    const isAscending = isSorted && sortDirection === 'asc';

    const handleSort = () => {
      if (isSorted) {
        // Toggle direction if already sorted
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        // Set new column and default to ascending
        setSortColumn(column);
        setSortDirection('asc');
      }
    };

    return (
      <th
        scope="col"
        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
        onClick={handleSort}
      >
        <div className="flex items-center">
          {children}
          {isSorted && (
            <span className="ml-2">
              {isAscending ? '▲' : '▼'}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Render method for professor name
  const renderProfessorName = (name?: string) => {
    return translateProfessorTitle(name);
  };

  // Get unique values for filters
  const uniqueDays = [...new Set(sessionsWithDetails.map(s => s.dayName))];
  const uniqueRooms = [...new Set(sessionsWithDetails.map(s => s.roomName))];
  const uniqueGroupSpecializations = [...new Set(sessionsWithDetails.map(s => s.groupSpecialization || 'غير محدد'))];

  const uniqueProfessors = React.useMemo(() => {
    // جميع الأساتذة الفريدين
    const allProfessors = [...new Set(
      sessionsWithDetails
        .filter(s => s.professorName)
        .map(s => s.professorName || 'أستاذ غير معروف')
    )];

    // إذا كان هناك بحث، قم بتصفية الأساتذة
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return allProfessors.filter(prof =>
        prof.toLowerCase().includes(searchTermLower)
      );
    }

    return allProfessors;
  }, [sessions, searchTerm]);

  // Keyboard navigation for professor dropdown
  const professorNavigation = useKeyboardNavigation({
    items: uniqueProfessors,
    isOpen: isDropdownOpen && searchTerm !== '',
    onSelect: (professor) => handleProfessorSelect(professor),
    onClose: () => setIsDropdownOpen(false),
    getItemId: (professor, index) => `sessions-professor-${index}`
  });

  // دالة اختيار الأستاذ
  const handleProfessorSelect = (professor: string) => {
    setFilterProfessor(professor);
    setSearchTerm(professor);
    setIsDropdownOpen(false);

    // تطبيق الفلترة مباشرة بعد اختيار الأستاذ
    applyFilters(professor);
  };

  // دالة إلغاء الفلترة
  const clearProfessorFilter = () => {
    setFilterProfessor('');
    setSearchTerm('');
    setIsDropdownOpen(false);

    // تطبيق الفلترة بدون أستاذ محدد
    applyFilters('');
  };

  const handleDeleteAssignment = async (assignment: AssignmentWithDetails) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المحاضرة؟')) return;
    try {
      await storeDeleteAssignment(assignment.id);
      addNotification({ type: 'success', message: 'تم حذف المحاضرة بنجاح' });
    } catch (error) {
      console.error('خطأ في حذف المحاضرة:', error);
      addNotification({ type: 'error', message: 'حدث خطأ أثناء حذف المحاضرة' });
    }
  };

  // Fonction pour exporter vers Excel avec ExcelJS
  const { settings: printSettings } = usePrintSettings();

  const exportToScheduleExcel = async (sessions: AssignmentWithDetails[]) => {
    try {
      const headers = ['اليوم', 'الوقت', 'المادة', 'الأستاذ', 'المجموعة', 'القاعة'];
      const data = sessions.map(session => [
        session.dayName,
        session.lecture_time,
        session.courseName,
        renderProfessorName(session.professorName),
        session.groupName,
        session.roomName
      ]);

      const title = 'جدول المحاضرات';
      const subtitle = `${filterGroupSpecialization ? `التخصص: ${filterGroupSpecialization}` : 'جميع التخصصات'}`;

      await exportTableToExcel(
        headers,
        data,
        title,
        subtitle,
        printSettings,
        'جدول_المحاضرات'
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('حدث خطأ أثناء التصدير إلى Excel');
    }
  };

  // دالة التصدير إلى PDF
  const exportToPDF = async () => {
    try {
      // إعداد بيانات الجدول للتصدير
      const tableData: string[][] = [];

      // إضافة بيانات الجلسات إلى الجدول
      sortedAndFilteredSessions.forEach(session => {
        tableData.push([
          session.dayName,
          session.lecture_time || `${session.start_time} - ${session.end_time}`,
          session.groupName,
          session.courseName,
          renderProfessorName(session.professorName),
          session.roomName
        ]);
      });

      // إنشاء عنوان ومعلومات الجدول
      const title = 'جدول المحاضرات';
      const today = new Date();
      const formattedDate = today.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const subtitle = `${filterGroupSpecialization ? `التخصص: ${filterGroupSpecialization}` : 'جميع التخصصات'} - ${formattedDate}`;

      // إنشاء رأس الجدول
      const headers = ['اليوم', 'الوقت', 'المجموعة', 'المقرر', 'الأستاذ', 'القاعة'];

      // إنشاء قالب HTML للجدول
      const htmlContent = await createTableTemplate(title, subtitle, headers, tableData);

      try {
        // إنشاء ملف PDF من قالب HTML
        await generatePDFFromHTML(htmlContent, {
          filename: `جدول_المحاضرات_${filterGroupSpecialization || 'جميع_التخصصات'}.pdf`,
          format: 'A4',
          landscape: true,
          margins: {
            top: '1cm',
            right: '1cm',
            bottom: '1cm',
            left: '1cm'
          }
        });
      } catch (pdfError) {
        console.error('خطأ في إنشاء PDF:', pdfError);
        // استخدام حل بديل إذا لم تنجح إنشاء PDF
        await generatePDFFromHTMLFallback(htmlContent, {
          filename: `جدول_المحاضرات_${filterGroupSpecialization || 'جميع_التخصصات'}.pdf`,
          format: 'A4',
          landscape: true
        });
      }
    } catch (error) {
      console.error('خطأ في تصدير PDF:', error);
      alert('حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.');
    }
  };

  const tableElement = React.useRef<HTMLTableElement>(null);

  // fetchData removed (handled by TanStack Query)


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => exportToScheduleExcel(sortedAndFilteredSessions)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          تصدير Excel
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          تصدير PDF
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Day Filter */}
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="">كل الأيام</option>
          {uniqueDays.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        {/* Room Filter */}
        <select
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="">كل القاعات</option>
          {uniqueRooms.map(room => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>

        {/* Group Specialization Filter */}
        <select
          value={filterGroupSpecialization}
          onChange={(e) => setFilterGroupSpecialization(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="">كل التخصصات</option>
          {uniqueGroupSpecializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        {/* Professor Search and Filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="البحث عن أستاذ"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);

              // إذا تم محو الحقل، قم بإلغاء الفلترة
              if (value === '') {
                clearProfessorFilter();
              } else {
                setIsDropdownOpen(true);
              }
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full px-2 py-1 border rounded"
          />

          {isDropdownOpen && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {uniqueProfessors.length > 0 ? (
                uniqueProfessors.map((professor, index) => (
                  <div
                    key={professor}
                    {...professorNavigation.getItemProps(professor, index)}
                    className={`px-4 py-2 cursor-pointer ${index === professorNavigation.selectedIndex
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                      }`}
                  >
                    {professor}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">لا توجد نتائج</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* عرض رسالة الخطأ إذا كان هناك خطأ */}
      {error && (
        <div className="mt-6">
          <DatabaseErrorAlert
            error={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">جاري تحميل البيانات...</p>
        </div>
      ) : !error ? (
        <>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table id="sessions-table" ref={tableElement} className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <SortableHeader column="courseName">المادة</SortableHeader>
                        <SortableHeader column="professorName">الأستاذ</SortableHeader>
                        <SortableHeader column="dayName">اليوم</SortableHeader>
                        <SortableHeader column="roomName">القاعة</SortableHeader>
                        <SortableHeader column="groupName">المجموعة</SortableHeader>
                        <SortableHeader column="lecture_time">وقت المحاضرة</SortableHeader>
                        <th className="border p-2">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedAndFilteredSessions.map((session) => (
                        <tr key={session.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-left text-sm font-medium text-gray-900 sm:pl-0">
                            {session.courseName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-left text-sm text-gray-500">
                            {renderProfessorName(session.professorName)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-left text-sm text-gray-500">
                            {session.dayName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-left text-sm text-gray-500">
                            {session.roomName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-left text-sm text-gray-500">
                            {session.groupName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-left text-sm text-gray-500">
                            {session.lecture_time}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-left text-sm text-gray-500">
                            <button
                              onClick={() => handleDeleteAssignment(session)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                              title="حذف المحاضرة"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Sessions;