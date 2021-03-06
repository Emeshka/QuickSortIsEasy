package emeshka;

/**
 * Created by Alexandra on 01.03.2018.
 */
/**
 * Класс для описания состояния анимации, которую будет отыгрывать js.
 * В теории, класс был не обязателен, но может пригодиться, если менять способ анимации
 * */
public class SortState {
    public int chosen;//позиция выбранного, или опорного элемента
    public int type;//тип анимации (см. ниже)
    public int pos1;//позиция элемента который меняется 1
    public int pos2;//позиция элемента который меняется 2
    public int pointer1;//первая стрелочка
    public int pointer2;//вторая стрелочка
    public int border1;//левая граница рассматриваемого куска массива
    public int border2;//правая граница
    //изменение состоит в:
    // выбранном опорном элементе;
    // позициях двух элементов, которые щас поменяются;
    // двух стрелочках, которые демонстрируют позицию цикла;
    // двух границах, которые суть аргументы start и end метода quickSort(int[] a, int start, int end);
    //-1 и другие отрицательные - значит нету на данном шаге

    //Особое значение играет chosen = -1. Должно интерпретироваться как "посмотри, кого выбрали в предыдущий раз", благо
    //у js в распоряжении будет весь развернутый массив

    //тип анимации:
    // -1 - нет анимации, делаем следующую
    // 1 - отрисовать границы и стрелочки
    // 2 - подсветить опорный элемент и не выключать подветку
    // 3 - двигаем 1-ю стрелку
    // 4 - двигаем 2-ю стрелку
    // 5 - мигнуть 1-м элементом (который bigger)
    // 6 - мигнуть 2-м элементом
    // 7 - собственно анимация, как ползут числа
    public SortState(int chosen, int type, int pos1, int pos2, int pointer1, int pointer2, int border1, int border2) {
        this.chosen = chosen;
        this.type = type;
        this.pos1 = pos1;
        this.pos2 = pos2;
        this.pointer1 = pointer1;
        this.pointer2 = pointer2;
        this.border1 = border1;
        this.border2 = border2;
    }
}
