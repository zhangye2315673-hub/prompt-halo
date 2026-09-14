using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Text;
using System.Windows.Automation;

public static class HaloInput {
    public static string LastStage = "idle";
    public static int LastError = 0;
    public static uint LastSent = 0;
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int key);
    [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr hwnd, uint flags);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr hwnd, StringBuilder name, int max);
    [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern IntPtr SetFocus(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern IntPtr SetActiveWindow(IntPtr hwnd);
    [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
    [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool attach);
    [DllImport("user32.dll")] public static extern bool GetGUIThreadInfo(uint idThread, ref GUITHREADINFO info);
    [StructLayout(LayoutKind.Sequential)] public struct GUITHREADINFO { public uint cbSize; public uint flags; public IntPtr hwndActive; public IntPtr hwndFocus; public IntPtr hwndCapture; public IntPtr hwndMenuOwner; public IntPtr hwndMoveSize; public IntPtr hwndCaret; public RECT rcCaret; }
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int left; public int top; public int right; public int bottom; }
    [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hwnd, int command);
    [DllImport("user32.dll")] public static extern uint GetClipboardSequenceNumber();
    [DllImport("user32.dll", SetLastError = true)] private static extern uint SendInput(uint count, INPUT[] inputs, int size);
    [StructLayout(LayoutKind.Sequential)] private struct INPUT { public uint type; public INPUTUNION u; }
    [StructLayout(LayoutKind.Explicit)] private struct INPUTUNION {
        [FieldOffset(0)] public KEYBDINPUT ki;
        [FieldOffset(0)] public MOUSEINPUT mi;
    }
    [StructLayout(LayoutKind.Sequential)] private struct KEYBDINPUT {
        public ushort vk; public ushort scan; public uint flags; public uint time; public UIntPtr extra;
    }
    [StructLayout(LayoutKind.Sequential)] private struct MOUSEINPUT {
        public int dx; public int dy; public uint data; public uint flags; public uint time; public UIntPtr extra;
    }
    [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr OpenProcess(uint rights,bool inherit,uint pid);
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
    [DllImport("advapi32.dll",SetLastError=true)] static extern bool OpenProcessToken(IntPtr process,uint rights,out IntPtr token);
    [DllImport("advapi32.dll",SetLastError=true)] static extern bool GetTokenInformation(IntPtr token,int info,IntPtr buffer,int size,out int length);
    [DllImport("advapi32.dll")] static extern IntPtr GetSidSubAuthorityCount(IntPtr sid);
    [DllImport("advapi32.dll")] static extern IntPtr GetSidSubAuthority(IntPtr sid,uint index);
    public static int Integrity(uint pid) {
        IntPtr process=OpenProcess(0x1000,false,pid),token=IntPtr.Zero,buffer=IntPtr.Zero;
        try {
            if(process==IntPtr.Zero || !OpenProcessToken(process,8,out token))return -1;
            int length;GetTokenInformation(token,25,IntPtr.Zero,0,out length);
            if(length<=0)return -1;buffer=Marshal.AllocHGlobal(length);
            if(!GetTokenInformation(token,25,buffer,length,out length))return -1;
            IntPtr sid=Marshal.ReadIntPtr(buffer);byte count=Marshal.ReadByte(GetSidSubAuthorityCount(sid));
            return Marshal.ReadInt32(GetSidSubAuthority(sid,(uint)(count-1)));
        } finally {if(buffer!=IntPtr.Zero)Marshal.FreeHGlobal(buffer);if(token!=IntPtr.Zero)CloseHandle(token);if(process!=IntPtr.Zero)CloseHandle(process);}
    }
    public static bool KeyDown(int key) { return (GetAsyncKeyState(key) & 0x8000) != 0; }
    public static uint WindowPid(long handle) {
        uint pid; GetWindowThreadProcessId(new IntPtr(handle), out pid); return pid;
    }
    public static long FocusWindow(long handle) {
        IntPtr target = new IntPtr(handle); uint ignoredPid; uint thread = GetWindowThreadProcessId(target, out ignoredPid);
        GUITHREADINFO info = new GUITHREADINFO(); info.cbSize = (uint)Marshal.SizeOf(typeof(GUITHREADINFO));
        return GetGUIThreadInfo(thread, ref info) ? info.hwndFocus.ToInt64() : 0;
    }
    public static string WindowClass(long handle) {
        StringBuilder name = new StringBuilder(128); GetClassName(new IntPtr(handle), name, name.Capacity); return name.ToString();
    }
    public static bool Activate(long handle, uint pid, long focus) {
        IntPtr target = new IntPtr(handle);
        if (!IsWindow(target) || WindowPid(handle) != pid) { LastStage = "target-invalid"; return false; }
        if (focus != 0 && (!IsWindow(new IntPtr(focus)) || GetAncestor(new IntPtr(focus), 2) != target)) {
            LastStage = "focus-invalid"; return false;
        }
        // Most selections use a nonactivating menu: preserve the existing caret and selection.
        if (GetForegroundWindow() == target && (focus == 0 || FocusWindow(handle) == focus)) return true;
        if (IsIconic(target)) ShowWindowAsync(target, 9);
        SetForegroundWindow(target);
        for (int i = 0; i < 30 && GetForegroundWindow() != target; i++) Thread.Sleep(10);
        if (GetForegroundWindow() != target) { LastStage = "foreground-denied"; return false; }
        if (focus == 0 || FocusWindow(handle) == focus) return true;
        uint ignoredPid;
        uint targetThread = GetWindowThreadProcessId(new IntPtr(focus), out ignoredPid);
        uint callerThread = GetCurrentThreadId();
        bool attached = targetThread != callerThread && AttachThreadInput(callerThread, targetThread, true);
        try { SetFocus(new IntPtr(focus)); }
        finally { if (attached) AttachThreadInput(callerThread, targetThread, false); }
        for (int i=0; i<20; i++) { if (FocusWindow(handle)==focus) return true; Thread.Sleep(10); }
        LastStage = "focus-restore-denied"; return false;
    }
    private static INPUT Key(ushort vk, bool up) {
        INPUT input = new INPUT(); input.type = 1;
        input.u.ki.vk = vk; input.u.ki.flags = up ? 2u : 0u; return input;
    }

    private static INPUT Unicode(ushort value, bool up) {
        INPUT input = new INPUT(); input.type = 1;
        input.u.ki.vk = 0; input.u.ki.scan = value;
        input.u.ki.flags = 4u | (up ? 2u : 0u); // KEYEVENTF_UNICODE
        return input;
    }

    private static AutomationElement capturedEditor;
    private static string capturedToken;
    private static long capturedWindow;
    public static bool IsBrowser(uint pid) {
        string name = System.Diagnostics.Process.GetProcessById((int)pid).ProcessName.ToLowerInvariant();
        return name == "chrome" || name == "msedge" || name == "firefox" || name == "brave" || name == "opera" || name == "vivaldi" || name == "qqbrowser" || name == "360chrome" || name == "360se" || name == "browser";
    }
    private static bool WebEditor(AutomationElement element, long handle) {
        if (element == null || !element.Current.HasKeyboardFocus || !element.Current.IsEnabled || element.Current.IsPassword) return false;
        object value;
        bool editable = element.Current.ControlType == ControlType.Edit;
        if (element.TryGetCurrentPattern(ValuePattern.Pattern, out value)) editable = !((ValuePattern)value).Current.IsReadOnly;
        if (!editable) return false;
        bool document = false;
        AutomationElement node = element;
        for (int i=0; node != null && i<64; i++) {
            if (node.Current.ControlType == ControlType.Document) document = true;
            if (node.Current.NativeWindowHandle == handle) return document;
            node = TreeWalker.RawViewWalker.GetParent(node);
        }
        return false;
    }
    public static string CaptureEditor(long handle, uint pid) {
        capturedEditor = null; capturedToken = null; capturedWindow = 0;
        if (!IsBrowser(pid)) return "native";
        try {
            var editor = AutomationElement.FocusedElement;
            if (GetForegroundWindow().ToInt64() != handle || !WebEditor(editor, handle)) return "";
            capturedEditor = editor; capturedWindow = handle;
            capturedToken = Guid.NewGuid().ToString("N");
            return capturedToken;
        } catch { return ""; }
    }
    private static bool CheckEditor(long handle, uint pid, string token) {
        if (!IsBrowser(pid)) return token == "native";
        try {
            if (capturedEditor == null || capturedWindow != handle || String.IsNullOrEmpty(token) || token != capturedToken) return false;
            var current = AutomationElement.FocusedElement;
            return Automation.Compare(capturedEditor, current) && WebEditor(current, handle);
        } catch { return false; }
    }
    public static bool TypeText(long handle, uint pid, long focus, string editorToken, string text) {
        LastStage = "wait-for-key-release"; LastError = 0; LastSent = 0;
        if (text == null || text.Length == 0 || text.Length > 20000) { LastStage = "text-invalid"; return false; }
        for (int i = 0; i < 200; i++) {
            if (!KeyDown(0x12) && !KeyDown(0x20) && !KeyDown(0x10) && !KeyDown(0x11)) break;
            if (i == 199) { LastStage = "keys-still-down"; return false; }
            Thread.Sleep(10);
        }
        LastStage = "restore-foreground";
        if (!Activate(handle, pid, focus)) return false;
        if (GetForegroundWindow().ToInt64() != handle) { LastStage = "foreground-check"; return false; }
        if (!CheckEditor(handle, pid, editorToken)) { LastStage = "editor-not-confirmed"; return false; }
        var list = new System.Collections.Generic.List<INPUT>(text.Length * 2);
        foreach (char ch in text) {
            // Shift+Enter inserts a line break without submitting ChatGPT's composer.
            if (ch == '\n') { list.Add(Key(0x10, false)); list.Add(Key(0x0D, false)); list.Add(Key(0x0D, true)); list.Add(Key(0x10, true)); }
            else if (ch != '\r') { list.Add(Unicode(ch, false)); list.Add(Unicode(ch, true)); }
        }
        LastStage = "send-unicode";
        LastSent = SendInput((uint)list.Count, list.ToArray(), Marshal.SizeOf(typeof(INPUT)));
        LastError = LastSent == list.Count ? 0 : Marshal.GetLastWin32Error();
        LastStage = LastSent == list.Count ? "unicode-dispatched" : "send-input-rejected";
        return LastSent == list.Count;
    }
    public static bool Paste(long handle, uint pid, long focus) {
        LastStage = "wait-for-key-release"; LastError = 0; LastSent = 0;
        // Never send Ctrl+V until the physical summon keys are released.
        for (int i = 0; i < 200; i++) {
            if (!KeyDown(0x12) && !KeyDown(0x20) && !KeyDown(0x10) && !KeyDown(0x11)) break;
            if (i == 199) { LastStage = "keys-still-down"; return false; }
            Thread.Sleep(10);
        }
        LastStage = "restore-foreground";
        if (!Activate(handle, pid, focus)) return false;
        LastStage = "foreground-check";
        if (GetForegroundWindow().ToInt64() != handle) return false;
        INPUT[] inputs = { Key(0x11, false), Key(0x56, false), Key(0x56, true), Key(0x11, true) };
        LastSent = SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        LastError = LastSent == inputs.Length ? 0 : Marshal.GetLastWin32Error();
        LastStage = LastSent == inputs.Length ? "input-dispatched" : "send-input-rejected";
        // Event delivery does not prove an arbitrary target application consumed the paste.
        return LastSent == inputs.Length;
    }
}


