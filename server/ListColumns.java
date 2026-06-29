import java.sql.*;
public class ListColumns {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/quiz_db", "postgres", "abc@06@2003");
        ResultSet rs = conn.getMetaData().getColumns(null, "public", "answer_choices", "%");
        while(rs.next()) {
            System.out.println("COLUMN: " + rs.getString("COLUMN_NAME") + " - " + rs.getString("TYPE_NAME"));
        }
        conn.close();
    }
}
