package emeshka;

import java.util.ArrayList;

/**
 * Created by Alexandra on 01.03.2018.
 */
public class QuickSort {
    public static ArrayList<SortState> states = new ArrayList<>();

    /*private static String join(int[] arr, String separator) {
        if (null == arr || 0 == arr.length) return "";
        StringBuilder sb = new StringBuilder(256);
        sb.append(arr[0]);
        for (int i = 1; i < arr.length; i++) sb.append(separator).append(arr[i]);
        return sb.toString();
    }*/

    public static void quickSort(int[] a) {
        quickSort(a, 0, a.length - 1);
        //System.out.println("quickSort finished");
        Run.sendChanges();
        states = new ArrayList<>();
        //System.out.println(join(a, ", "));
    }

    private static void quickSort(int[] a, int start, int end) {
        states.add(new SortState(-1, 1, -1, -1, start, end, start, end));
        if (start >= end) return;
        int i = start, j = end;
        int n = i - (i - j)/2;
        states.add(new SortState(n, 2, -1, -1, start, end, start, end));
        while (i<j) {
            //System.out.println(i+", "+j);
            while (i < n && (a[i] < a[n])) {
                states.add(new SortState(n, 3, -1, -1, i, end, start, end));
                i++;
            }
            if (!(i < n && (a[i] < a[n]))) states.add(new SortState(n, 5, i, j, i, end, start, end));
            while (j > n && (a[n] <= a[j])) {
                states.add(new SortState(n, 4, -1, -1, i, j, start, end));
                j--;
            }
            if (!(j > n && (a[n] <= a[j]))) states.add(new SortState(n, 6, i, j, i, j, start, end));
            if (i < j) {
                int temp = a[i];
                a[i] = a[j];
                a[j] = temp;
                states.add(new SortState(n, 7, i, j, i, j, start, end));
                if (i == n)
                    n = j;
                else if (j == n)
                    n = i;
            }
        }
        quickSort(a, start, n);
        quickSort(a, n + 1, end);
    }
}
