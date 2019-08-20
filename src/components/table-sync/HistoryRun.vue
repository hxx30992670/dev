<template>
    <div>
        <el-table :data="history" stripe border header-cell-class-name="th-style">
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column label="同步名称" prop="syncName"></el-table-column>
            <el-table-column label="开始时间" prop="startTime" :formatter="getTime"></el-table-column>
            <el-table-column label="结束时间" prop="stopTime" :formatter="getTime"></el-table-column>
            <el-table-column label="执行结果" prop="status" width="70">
                <template slot-scope="scope">
                    <span v-if="scope.row.status == 3">完成</span>
                    <span v-else style="color:#F56C86">失败</span>
                </template>
            </el-table-column>
            <el-table-column label="源端抽取数据量" prop="readTotal"></el-table-column>
            <el-table-column label="目的端写入数据量" prop="writeTotal"></el-table-column>
        </el-table>
        <div class="function-box">
            <el-button type="info" @click="download()">下载</el-button>
            <el-button type="primary" @click="refreshData">刷新</el-button>
            <!--分页-->
            <div class="page-wrap">
                <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="historypage"
                        :page-size="historysize"
                        layout="total, prev, pager, next, jumper"
                        :total="historytotal">
                </el-pagination>
            </div>
        </div>
       <!-- <div class="submit-box" style="padding:20px 0 0 ">
            <el-button type="primary" @click="closeHistory">关闭</el-button>
        </div>-->
    </div>
</template>

<script>
    import moment from "moment";
    import request from "@/libs/request";

    export default {
        name: "HistoryRun",
        props: {
            historyid: {
                type: String,
                required: true
            },
            history: {
                type: Array,
                required: true
            },
          historypage:{
                type: Number,
                required: true
            },
          historysize:{
            type: Number,
            required: true
          },
          historytotal:{
            type: Number,
            required: true
          }
        },
        data() {
            return {
                currentPage: 1,//分页初始值为1
                totalNum: 0,//分页总数
                pageSize: 10,//设置分页大小
            }
        },
        methods: {
            getTime(row, col, val) { //格式化时间
                if (val) {
                    return moment(val).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            handleSizeChange(val) { //改变每页显示多少条
                this.historysize = val;

            },
            handleCurrentChange(val) { //改变显示的页数
                this.historypage = val;
                this.$emit("get-history",val);
            },
            async download() {
                window.open("/api/collection/data/sync/exportHistory?id="+this.historyid);
            },
            refreshData() { //刷新数据
                this.$emit("get-history");
            },
            closeHistory() { //关闭历史记录弹窗
                this.$emit("close-new-add");
            }
        }
    }
</script>

<style scoped lang="less">
    .function-box {
        padding-top: 20px;
        display: flex;
        align-items: center;
        .page-wrap {
            padding-left: 20px;
        }
    }

    .submit-box {
        padding-top: 20px;
        text-align: center;
    }
</style>
